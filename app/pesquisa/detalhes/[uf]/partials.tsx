"use client";
import { useMemo, useState } from "react";
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
import { MOCK_INDICADORES_CONFIG } from "@/lib/mock-indicadores";
import { useFavoritos } from "@/lib/favoritos";
import { toast } from "sonner";

export default function DetalhesContent({ estadoUF }: { estadoUF: string }) {
  const estado = ESTADOS.find((e) => e.uf === estadoUF)!;
  const [compararEstado, setCompararEstado] = useState<{
    uf: string;
    nome: string;
  } | null>(null);

  // Consumindo categorias a partir do mock (simulando resposta de API)
  const categorias = MOCK_INDICADORES_CONFIG.categorias;

  function computeMetric(uf: string, categoria: string) {
    const seed =
      uf.split("").reduce((a, c) => a + c.charCodeAt(0), 0) +
      categoria.length * 13;
    const indice = (seed % 100) / 100;
    const media = 200 + (seed % 500);
    return { indice, media };
  }

  const indicadores = useMemo(() => {
    return categorias.map((categoria) => {
      const nacional = computeMetric("BR", categoria.id);
      const base = computeMetric(estado.uf, categoria.id);
      const comparado = compararEstado
        ? computeMetric(compararEstado.uf, categoria.id)
        : null;
      return { categoria: categoria.label, nacional, base, comparado };
    });
  }, [categorias, estado.uf, compararEstado]);

  const { favoritos, add, remove, loading: favLoading } = useFavoritos();
  const isFavorito = favoritos.some(f => f.uf === estado.uf);

  return (
    <main className="flex-1 px-8 py-12 space-y-10">
      <header className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="order-2 md:order-1 text-3xl font-semibold tracking-tight">
            {compararEstado ? "Comparando" : expandEstadoUF(estado.uf)}
          </h1>
          {!compararEstado && (
            <div className="order-1 md:order-2 mb-2 md:mb-0">
              <Button
                data-test-id="adicionar-favorito-button"
                variant={isFavorito ? 'outline' : 'default'}
                disabled={favLoading}
                onClick={async () => {
                  if (isFavorito) {
                    const result = await remove(estado.uf);
                    if (result.ok) {
                      toast.success(`${estado.nome} removido dos favoritos`);
                    } else {
                      toast.error(result.error || 'Falha ao remover favorito');
                    }
                  } else {
                    const result = await add(estado.uf);
                    if (result.ok) {
                      toast.success(`${estado.nome} adicionado aos favoritos`);
                    } else {
                      toast.error(result.error || 'Falha ao adicionar favorito');
                    }
                  }
                }}
              >
                {isFavorito ? 'Remover favorito' : 'Adicionar favorito'}
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
                {MOCK_INDICADORES_CONFIG.colunas.base.indice}
              </TableHead>
              {/* Cada estado apenas possui sua coluna de Média (R$) */}
              <TableHead className="w-40 text-center font-semibold">
                {expandEstadoUF(estado.uf)}, {estado.uf}
              </TableHead>
              {compararEstado && (
                <TableHead className="w-40 text-center font-semibold">
                  {expandEstadoUF(compararEstado.uf)}, {compararEstado.uf}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {indicadores.map((row) => {
              const nacionalIndice = row.nacional.indice.toFixed(2);
              const baseMedia = formatCurrency(row.base.media);
              const compMedia = row.comparado
                ? formatCurrency(row.comparado.media)
                : null;
              return (
                <TableRow key={row.categoria}>
                  <TableCell className="font-semibold">
                    {row.categoria}
                  </TableCell>
                  {/* Índice Nacional */}
                  <TableCell className="text-center">
                    {nacionalIndice}
                  </TableCell>
                  {/* Média do estado base */}
                  <TableCell className="text-center">{baseMedia}</TableCell>
                  {/* Média do estado comparado (quando houver) */}
                  {compararEstado && (
                    <TableCell className="text-center">{compMedia}</TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
          <TableCaption className="text-left">
            {MOCK_INDICADORES_CONFIG.colunas.caption}
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
