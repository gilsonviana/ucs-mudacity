"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Falha ao sair');
      router.replace('/');
    } catch (e: any) {
      toast.error(e.message || 'Erro ao sair');
    } finally {
      setSigningOut(false);
    }
  }
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <Link href="/" className="text-xl font-bold tracking-tight">Mudacity.</Link>
      <nav className="flex items-center gap-8 text-sm font-medium">
        <Link href="/favoritos" className="hover:underline" data-test-id="header-favoritos-link">
          Meus Favoritos
        </Link>
        <button onClick={handleLogout} disabled={signingOut} className="hover:underline disabled:opacity-50" data-test-id="logout-button">
          {signingOut ? 'Saindo...' : 'Sair'}
        </button>
      </nav>
    </header>
  );
}

export default Header;
