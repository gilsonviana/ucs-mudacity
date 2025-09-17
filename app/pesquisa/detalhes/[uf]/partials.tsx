"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import CompararEstados from "@/components/comparar-estados";
import { ESTADOS } from "@/lib/estados";
import { useFavoritos } from "@/lib/favoritos";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DetalhesContent({ estadoUF }: { estadoUF: string }) {
  const estado = ESTADOS.find((e) => e.uf === estadoUF)!;
  const [compararEstado, setCompararEstado] = useState<{
    uf: string;
    nome: string;
  } | null>(null);

  interface ApiCategoriaBase {
    id: string;
    label: string;
    descricao?: string;
    nacional: { media: number; indice: number };
    estado: { media: number | null; indice: number | null };
  }
  const [apiCategorias, setApiCategorias] = useState<ApiCategoriaBase[]>([]);
  const [apiCategoriasComparado, setApiCategoriasComparado] = useState<ApiCategoriaBase[] | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Load base UF indicadores
  useEffect(() => {
    let active = true;
    async function load() {
      setApiLoading(true);
      setApiError(null);
      try {
        const res = await fetch(`/api/indicadores/${estado.uf}`);
        if (!res.ok) throw new Error("Falha ao carregar indicadores");
        const json = await res.json();
        if (active) setApiCategorias(json.categorias || []);
      } catch (e: any) {
        if (active) setApiError(e.message || "Erro desconhecido");
      } finally {
        if (active) setApiLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [estado.uf]);

  // Load comparison UF indicadores when selected
  useEffect(() => {
    if (!compararEstado) {
      setApiCategoriasComparado(null);
      setCompareError(null);
      return;
    }
    let active = true;
    async function loadCompare() {
      if (!compararEstado) return; // guard for TS
      const uf = compararEstado.uf;
      setCompareLoading(true);
      setCompareError(null);
      try {
        const res = await fetch(`/api/indicadores/${uf}`);
        if (!res.ok) throw new Error('Falha ao carregar indicadores do comparado');
        const json = await res.json();
        if (active) setApiCategoriasComparado(json.categorias || []);
      } catch (e: any) {
        if (active) setCompareError(e.message || 'Erro desconhecido');
      } finally {
        if (active) setCompareLoading(false);
      }
    }
    loadCompare();
    return () => { active = false; };
  }, [compararEstado]);

  const router = useRouter();
  const indicadores = useMemo(() => apiCategorias, [apiCategorias]);
  const indicadoresComparado = useMemo(() => apiCategoriasComparado, [apiCategoriasComparado]);

  const { favoritos, add, remove, loading: favLoading } = useFavoritos();
  const isFavorito = favoritos.some((f) => f.uf === estado.uf);

  return (
    <main className="flex-1 px-8 py-12 space-y-10">
      <Button
        variant="ghost"
        className="mb-2 flex items-center gap-2"
        onClick={() => router.back()}
        data-test-id="favoritos-back-button"
      >
        <span className="material-symbols-outlined text-base">←</span>
        Voltar
      </Button>
      <header className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="order-2 md:order-1 text-3xl font-semibold tracking-tight">
            {compararEstado ? "Comparando" : expandEstadoUF(estado.uf)}
          </h1>
          {!compararEstado && (
            <div className="order-1 md:order-2 mb-2 md:mb-0">
              <Button
                data-test-id="adicionar-favorito-button"
                variant={isFavorito ? "outline" : "default"}
                disabled={favLoading}
                onClick={async () => {
                  if (isFavorito) {
                    const result = await remove(estado.uf);
                    if (result.ok) {
                      toast.success(`${estado.nome} removido dos favoritos`);
                    } else {
                      toast.error(result.error || "Falha ao remover favorito");
                    }
                  } else {
                    const result = await add(estado.uf);
                    if (result.ok) {
                      toast.success(`${estado.nome} adicionado aos favoritos`);
                    } else {
                      toast.error(
                        result.error || "Falha ao adicionar favorito"
                      );
                    }
                  }
                }}
              >
                {isFavorito ? "Remover favorito" : "Adicionar favorito"}
              </Button>
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Abaixo voce encontrará as principais informações em nosso banco de
          dados.
        </p>
      </header>

      <section>
        <Table className="border border-gray-200">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-64">Categoria</TableHead>
              {/* Índice Nacional sempre primeiro */}
              <TableHead className="w-32 text-center">
                Índice Nacional
              </TableHead>
              {/* Cada estado apenas possui sua coluna de Média (R$) */}
              <TableHead className="w-40 text-center font-semibold">
                {expandEstadoUF(estado.uf)}, {estado.uf}
              </TableHead>
              {compararEstado && (
                <>
                  <TableHead className="w-40 text-center font-semibold">
                    {expandEstadoUF(compararEstado.uf)}, {compararEstado.uf}
                  </TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiLoading && (
              <TableRow>
                <TableCell
                  colSpan={compararEstado ? 4 : 3}
                  className="text-center text-sm text-muted-foreground"
                >
                  Carregando...
                </TableCell>
              </TableRow>
            )}
            {apiError && !apiLoading && (
              <TableRow>
                <TableCell
                  colSpan={compararEstado ? 4 : 3}
                  className="text-center text-sm text-destructive"
                >
                  {apiError}
                </TableCell>
              </TableRow>
            )}
            {!apiLoading && !apiError && indicadores.map((cat) => {
              const nacionalIndice = cat.nacional.indice.toFixed(2);
              const mediaEstado = cat.estado.media != null ? formatCurrency(cat.estado.media) : '—';
              let mediaComparado: React.ReactNode = null;
              if (compararEstado) {
                if (compareLoading) mediaComparado = <span className="text-muted-foreground">...</span>;
                else if (compareError) mediaComparado = <span className="text-destructive">ERR</span>;
                else if (indicadoresComparado) {
                  const match = indicadoresComparado.find(c => c.id === cat.id);
                  mediaComparado = match && match.estado.media != null ? formatCurrency(match.estado.media) : '—';
                } else mediaComparado = '—';
              }
              return (
                <TableRow key={cat.id}>
                  <TableCell className="font-semibold">{cat.label}</TableCell>
                  <TableCell className="text-center">{nacionalIndice}</TableCell>
                  <TableCell className="text-center">{mediaEstado}</TableCell>
                  {compararEstado && (
                    <TableCell className="text-center">{mediaComparado}</TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
          <TableCaption className="text-left">
            * Valores mensais estimados (dados reais do banco).
          </TableCaption>
        </Table>
      </section>

      <div>
        <CompararEstados
          onSelect={(e) => setCompararEstado(e)}
          selected={compararEstado}
          disabledUFs={[estado.uf]}
        />
        {compararEstado && (
          <p className="text-xs text-muted-foreground mt-2">
            Comparando {estado.nome} com {compararEstado.nome}
          </p>
        )}
      </div>
    </main>
  );
}

function expandEstadoUF(uf: string) {
  return ESTADOS.find((e) => e.uf === uf)?.nome || uf;
}

function formatCurrency(value: number) {
  return value
    .toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(".", ",");
}
