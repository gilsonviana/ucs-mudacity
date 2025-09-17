import { NextResponse } from "next/server";
import { ESTADOS } from "@/lib/estados";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  let results = ESTADOS;
  if (q) {
    results = ESTADOS.filter(
      (e) =>
        e.uf.toLowerCase().includes(q) ||
        e.nome.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(
          q.normalize("NFD").replace(/\p{Diacritic}/gu, "")
        )
    );
  }

  const res = NextResponse.json({
    query: q,
    total: results.length,
    items: results.slice(0, limit),
  });
  // Cache public estados list for 24h since it is static data
  res.headers.set(
    'Cache-Control',
    'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600'
  );
  return res;
}
