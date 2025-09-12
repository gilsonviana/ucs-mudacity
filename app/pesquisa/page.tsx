"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Pesquisa() {
  const [estado, setEstado] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Implement real search logic
    console.log("Pesquisando estado:", estado);
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
          <div className="text-xl font-bold tracking-tight">Mudacity</div>
          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link href="#" className="hover:underline">
              Meus Favoritos
            </Link>
            <Link href="../" className="hover:underline">
              Sair
            </Link>
          </nav>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center px-6 py-12">
          <div className="w-full max-w-xl">
            <p className="text-lg leading-relaxed text-center">
              Vamos começar. Nos informe o nome da cidade que está procurando.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do Estado"
                  value={estado}
                  aria-label="Nome do Estado"
                  onChange={(e) => setEstado(e.target.value)}
                />
                <Button type="submit">Pesquisar</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Entre o nome do Estado que gostaria de obter os dados.
              </p>
            </form>
          </div>
        </main>

        {/* Sticky footer */}
        <footer className="mt-auto sticky bottom-0 w-full bg-gray-100 border-t px-6 py-4 flex justify-end">
          <Button className="ml-auto" disabled>Avançar</Button>
        </footer>
      </div>
    </>
  );
}
