"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { useFavoritos } from "@/lib/favoritos";
import { ESTADOS } from "@/lib/estados";

export default function FavoritosPage() {
  const router = useRouter();
  const { favoritos, remove, clear, refresh } = useFavoritos();

  // Refresh on focus (simple heuristic)
  useEffect(() => {
    function onFocus() { refresh(); }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 px-8 py-10 max-w-5xl w-full mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Button variant="ghost" className="mb-2 flex items-center gap-2" onClick={() => router.back()} data-test-id="favoritos-back-button">
              <span className="material-symbols-outlined text-base">←</span>
              Voltar
            </Button>
            <h1 className="text-3xl font-semibold tracking-tight">Meus Favoritos</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-prose">
              Estados que você marcou para acompanhar. Você pode adicionar mais na página de detalhes.
            </p>
          </div>
          {favoritos.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => clear()} data-test-id="favoritos-clear-button">Limpar tudo</Button>
            </div>
          )}
        </div>

        {favoritos.length === 0 ? (
          <div className="border border-dashed rounded-lg p-12 text-center space-y-4">
            <p className="text-muted-foreground">Você ainda não adicionou nenhum favorito.</p>
            <Button onClick={() => router.push('/pesquisa')} data-test-id="favoritos-go-search-button">Adicionar agora</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoritos.map(f => (
              <div key={f.uf} className="border rounded-lg p-4 flex flex-col gap-3 bg-white/60 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-medium leading-none">{f.nome}</h2>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-100 border">{f.uf}</span>
                      Adicionado {new Date(f.addedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" data-test-id={`remover-favorito-${f.uf}`} onClick={() => remove(f.uf)}>Remover</Button>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button size="sm" className="flex-1" onClick={() => router.push(`/pesquisa/detalhes/${f.uf}`)}>Ver detalhes</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {favoritos.length > 0 && (
          <p className="text-xs text-muted-foreground">Total: {favoritos.length} estado(s).</p>
        )}
      </main>
      <footer className="px-8 py-6 text-xs text-center text-muted-foreground border-t bg-white/50 backdrop-blur">
        Mudacity • Favoritos locais (não sincronizado)
      </footer>
    </div>
  );
}
