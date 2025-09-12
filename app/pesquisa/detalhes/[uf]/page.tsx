import { notFound } from "next/navigation";
import DetalhesContent from "./partials";
import { ESTADOS } from "@/lib/estados";

interface DetalhesProps {
  params: { uf: string };
}

export default function DetalhesPage({ params }: DetalhesProps) {
  const ufParam = (params?.uf || "").toUpperCase();
  const estado = ESTADOS.find((e) => e.uf === ufParam);
  if (!estado) notFound();
  return <DetalhesContent estadoUF={estado.uf} />;
}

function formatCurrency(value: number) {
  return value
    .toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(".", ",");
}

function expandEstadoUF(uf: string) {
  return ESTADOS.find((e) => e.uf === uf)?.nome || uf;
}
