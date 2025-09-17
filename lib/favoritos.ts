"use client";
import { useCallback, useEffect, useState } from "react";
import { ESTADOS } from "@/lib/estados";

export interface FavoritoEstado {
  uf: string;
  nome: string;
  addedAt: string; // ISO timestamp
}

async function fetchFavoritos(): Promise<FavoritoEstado[]> {
  try {
    const res = await fetch('/api/favoritos', { method: 'GET' });
    if (!res.ok) return [];
    const j = await res.json();
    if (!Array.isArray(j.items)) return [];
    return j.items.map((it: any) => ({
      uf: it.uf,
      nome: it.nome,
      addedAt: it.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function addFavorito(uf: string): Promise<{ ok: boolean; error?: string }> {
  const estado = ESTADOS.find((e) => e.uf === uf);
  if (!estado) return { ok: false, error: 'Estado não encontrado' };
  try {
    const res = await fetch('/api/favoritos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uf: uf.toUpperCase(), nome: estado.nome })
    });
    if (!res.ok && res.status !== 409) {
      let msg = 'Falha ao salvar no servidor';
      try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Erro de rede' };
  }
}

export async function removeFavorito(uf: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/favoritos/${encodeURIComponent(uf)}`, { method: 'DELETE' });
    if (!res.ok) return { ok: false, error: 'Erro ao remover' };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Erro de rede' };
  }
}

export async function clearFavoritos(): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/favoritos', { method: 'DELETE' });
    if (!res.ok) return { ok: false, error: 'Erro ao limpar' };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Erro de rede' };
  }
}

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<FavoritoEstado[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const load = useCallback(async () => {
    setLoading(true);
    const items = await fetchFavoritos();
    setFavoritos(items.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (uf: string) => {
    const result = await addFavorito(uf);
    await load();
    return result;
  }, [load]);

  const remove = useCallback(async (uf: string) => {
    const result = await removeFavorito(uf);
    await load();
    return result;
  }, [load]);

  const clear = useCallback(async () => {
    const result = await clearFavoritos();
    await load();
    return result;
  }, [load]);

  return { favoritos, loading, add, remove, clear, refresh: load };
}
