"use client";
import { useCallback, useEffect, useState } from "react";
import { ESTADOS } from "@/lib/estados";

export interface FavoritoEstado {
  uf: string;
  nome: string;
  addedAt: string; // ISO timestamp
}

const STORAGE_KEY = "mudacity:favoritos:v1";

function readStorage(): FavoritoEstado[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FavoritoEstado[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((f) => typeof f.uf === "string" && typeof f.nome === "string");
  } catch {
    return [];
  }
}

function writeStorage(favoritos: FavoritoEstado[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
  } catch {
    // ignore quota errors
  }
}

export async function addFavorito(uf: string): Promise<{ ok: boolean; error?: string }> {
  const estado = ESTADOS.find((e) => e.uf === uf);
  if (!estado) return { ok: false, error: 'Estado não encontrado' };
  const current = readStorage();
  if (current.some((c) => c.uf === uf)) return { ok: true }; // already exists locally
  // Optimistic local add
  const entry: FavoritoEstado = { uf, nome: estado.nome, addedAt: new Date().toISOString() };
  writeStorage([...current, entry]);
  try {
    const res = await fetch('/api/favoritos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uf: uf.toUpperCase(), nome: estado.nome })
    });
    if (!res.ok) {
      // Rollback local insert if server rejected (except conflict 409 where server already has it)
      if (res.status !== 409) {
        writeStorage(current); // rollback
      }
      let msg = 'Falha ao salvar no servidor';
      try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
      return { ok: res.status === 409, error: msg };
    }
    return { ok: true };
  } catch (e: any) {
    // Network failure – keep optimistic local copy
    return { ok: false, error: e?.message || 'Erro de rede' };
  }
}

export function removeFavorito(uf: string) {
  const next = readStorage().filter((f) => f.uf !== uf);
  writeStorage(next);
}

export function clearFavoritos() {
  writeStorage([]);
}

export function getFavoritos(): FavoritoEstado[] {
  return readStorage().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<FavoritoEstado[]>([]);

  useEffect(() => {
    setFavoritos(getFavoritos());
  }, []);

  const sync = useCallback(() => {
    setFavoritos(getFavoritos());
  }, []);

  const add = useCallback(async (uf: string) => {
    await addFavorito(uf);
    sync();
  }, [sync]);

  const remove = useCallback((uf: string) => {
    removeFavorito(uf);
    sync();
  }, [sync]);

  const clear = useCallback(() => {
    clearFavoritos();
    sync();
  }, [sync]);

  return { favoritos, add, remove, clear, refresh: sync };
}
