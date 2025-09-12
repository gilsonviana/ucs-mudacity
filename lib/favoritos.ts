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

export function addFavorito(uf: string) {
  const estado = ESTADOS.find((e) => e.uf === uf);
  if (!estado) return;
  const current = readStorage();
  if (current.some((c) => c.uf === uf)) return; // avoid duplicates
  const entry: FavoritoEstado = { uf, nome: estado.nome, addedAt: new Date().toISOString() };
  writeStorage([...current, entry]);
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

  const add = useCallback((uf: string) => {
    addFavorito(uf);
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
