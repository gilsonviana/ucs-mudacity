import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/app/utils/supabase/admin';

export const runtime = 'nodejs';

interface CategoriaResult {
  id: string;
  label: string;
  descricao?: string;
  nacional: { media: number; indice: number };
  estado: { media: number | null; indice: number | null };
}

const CATEGORIAS: Array<{ id: string; label: string; descricao: string; table: string }> = [
  { id: 'alimentacao', label: 'Alimentação', descricao: 'Custos médios com alimentação', table: 'CustoAlimentacao' },
  { id: 'saude', label: 'Saúde', descricao: 'Indicadores relativos a saúde', table: 'CustoSaude' },
  { id: 'aluguel', label: 'Aluguél', descricao: 'Custos e índice de aluguél', table: 'CustoAluguel' },
];

export async function GET(_req: NextRequest, { params }: { params: { uf: string } }) {
  const ufParam = params.uf?.toUpperCase();
  if (!ufParam || !/^[A-Z]{2}$/.test(ufParam)) {
    return NextResponse.json({ error: 'UF inválida' }, { status: 400 });
  }
  const client = getAdminClient();

  const categorias: CategoriaResult[] = [];

  for (const cat of CATEGORIAS) {
    const { data, error } = await client.from(cat.table).select('uf,custo');
    if (error) {
      return NextResponse.json({ error: `Erro ao consultar ${cat.table}` }, { status: 500 });
    }
    if (!data || data.length === 0) {
      categorias.push({
        id: cat.id,
        label: cat.label,
        descricao: cat.descricao,
        nacional: { media: 0, indice: 1 },
        estado: { media: null, indice: null },
      });
      continue;
    }
    const normalized = data.map((row: any) => {
      let custo = row.custo ?? 0;
      if (cat.table === 'CustoAlimentacao' && typeof custo === 'number') {
        custo = custo / 12;
      }
      return { uf: row.uf, custo };
    });
    const total = normalized.reduce((sum: number, row: any) => sum + (row.custo ?? 0), 0);
    const avg = total / normalized.length;
    const record = normalized.find((r: any) => r.uf?.toUpperCase() === ufParam) as any | undefined;
    const mediaEstado = record ? record.custo : null;
    const indiceEstado = mediaEstado != null && avg > 0 ? mediaEstado / avg : null;
    categorias.push({
      id: cat.id,
      label: cat.label,
      descricao: cat.descricao,
      nacional: { media: avg, indice: 1 },
      estado: { media: mediaEstado, indice: indiceEstado },
    });
  }

  const res = NextResponse.json({
    fonte: 'Mudacity DataLab',
    moeda: 'BRL',
    updatedAt: new Date().toISOString(),
    categorias,
    colunas: {
      base: { media: 'Média (R$)', indice: 'Índice Nacional' },
      comparado: { media: 'Média (R$)', indice: 'Índice Nacional' },
      caption: '* Valores mensais estimados (dados reais simulados a partir do banco).',
    },
  });
  res.headers.set('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600');
  return res;
}
