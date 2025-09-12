"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import EstadoSearch, { type EstadoItem } from "@/components/estado-search";
import LoadingOverlay from "@/components/ui/loading-overlay";

export default function Pesquisa() {
  const [estadoTexto, setEstadoTexto] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<EstadoItem | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Implement real search logic
    console.log("Pesquisando estado:", selectedEstado || estadoTexto);
  }

  return (
    <>
      <main className="flex-1 flex flex-col  md:justify-center items-center px-6 py-12">
        <div className="w-full max-w-xl">
          <h1 className="text-4xl md:text-6xl font-bold mt-8 drop-shadow-sm mb-4">01. Estado</h1>
          <p className="text-lg leading-relaxed text-center">
            Vamos começar. Nos informe o nome do estado que está procurando.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-2">
            <div className="flex gap-2">
              <EstadoSearch
                value={selectedEstado ?? undefined}
                onChange={(item) => setSelectedEstado(item)}
                placeholder="Nome do Estado"
                inputTestId="estado-pesquisa-input"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Entre o nome do Estado que gostaria de obter os dados.
            </p>
          </form>
        </div>
      </main>
      <footer className="mt-auto sticky bottom-0 w-full bg-gray-100 border-t px-6 py-4 flex justify-end">
        <Button
          data-test-id="avancar-pesquisa-button"
          className="ml-auto"
          disabled={!selectedEstado}
          type="button"
          onClick={() => {
            if (!selectedEstado || loading) return;
            setLoading(true);
            timeoutRef.current = setTimeout(() => {
              router.push(`/pesquisa/detalhes/${selectedEstado.uf}`);
            }, 2000);
          }}
        >
          Avançar
        </Button>
      </footer>
      <LoadingOverlay
        open={loading}
        message="Carregando dados do Estado..."
        testId="pesquisa-loading-overlay"
        spinnerSize={44}
      />
    </>
  );
}
