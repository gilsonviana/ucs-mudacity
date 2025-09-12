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

export default function DetalhesContent({ estadoUF }: { estadoUF: string }) {
  const estado = ESTADOS.find((e) => e.uf === estadoUF)!;
  const [compararEstado, setCompararEstado] = useState<{ uf: string; nome: string } | null>(null);

  const categorias = ["Alimentacao", "Saúde", "Transporte"] as const;

  function computeMetric(uf: string, categoria: string) {
    const seed = uf.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + categoria.length * 13;
    const indice = (seed % 100) / 100;
    const media = 200 + (seed % 500);
    return { indice, media };
  }

  const indicadores = useMemo(() => {
    return categorias.map((categoria) => {
      const nacional = computeMetric("BR", categoria);
      const base = computeMetric(estado.uf, categoria);
      const comparado = compararEstado ? computeMetric(compararEstado.uf, categoria) : null;
      return { categoria, nacional, base, comparado };
    });
  }, [categorias, estado.uf, compararEstado]);

  return (
    <main className="flex-1 px-8 py-12 space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">{compararEstado ? 'Comparando' : expandEstadoUF(estado.uf)}</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Abaixo voce encontrará as principais informações em nosso banco de dados.
        </p>
      </header>

      <section>
        <Table className="border border-gray-200">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-64 align-bottom" rowSpan={2}>Categoria</TableHead>
              {compararEstado && (
                <TableHead className="text-center font-semibold" colSpan={2}>
                  {expandEstadoUF(compararEstado.uf)}, {compararEstado.uf}
                </TableHead>
              )}
              <TableHead className="text-center font-semibold" colSpan={compararEstado ? 1 : 2}>
                {expandEstadoUF(estado.uf)}, {estado.uf}
              </TableHead>
            </TableRow>
            <TableRow>
              {compararEstado && (
                <>
                  <TableHead className="w-40">Índice Nacional</TableHead>
                  <TableHead className="w-40">Média (R$)</TableHead>
                </>
              )}
              <TableHead className="w-40">Média (R$)</TableHead>
              {!compararEstado && (
                <TableHead className="w-40">Índice Nacional</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {indicadores.map((row) => {
              const baseMedia = formatCurrency(row.base.media);
              const baseIndice = row.base.indice.toFixed(2);
              const compMedia = row.comparado ? formatCurrency(row.comparado.media) : null;
              const compIndice = row.comparado ? row.comparado.indice.toFixed(2) : null;
              return (
                <TableRow key={row.categoria}>
                  <TableCell className="font-semibold">{row.categoria}</TableCell>
                  {compararEstado && (
                    <>
                      <TableCell>{compIndice}</TableCell>
                      <TableCell>{compMedia}</TableCell>
                    </>
                  )}
                  <TableCell>{baseMedia}</TableCell>
                  {!compararEstado && <TableCell>{baseIndice}</TableCell>}
                </TableRow>
              );
            })}
          </TableBody>
          <TableCaption className="text-left">* Valores mensais estimados (dados simulados).</TableCaption>
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

      {!compararEstado && (
        <div className="fixed top-20 right-8">
          <Button>Adicionar favorito</Button>
        </div>
      )}
    </main>
  );
}

function expandEstadoUF(uf: string) {
  return ESTADOS.find((e) => e.uf === uf)?.nome || uf;
}

function formatCurrency(value: number) {
  return value
    .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(".", ",");
}
