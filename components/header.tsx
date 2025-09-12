"use client";

import Link from "next/link";
import React from "react";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="text-xl font-bold tracking-tight">Mudacity.</div>
      <nav className="flex items-center gap-8 text-sm font-medium">
        <Link href="#" className="hover:underline">
          Meus Favoritos
        </Link>
        <Link href="../" className="hover:underline">
          Sair
        </Link>
      </nav>
    </header>
  );
}

export default Header;
