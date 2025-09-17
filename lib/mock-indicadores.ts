// Mock API response for indicadores (categorias, labels, metadata)
// This simulates what a backend JSON response might look like so JSX avoids hardcoded literals.

export interface IndicadorCategoriaConfig {
  id: string;           // machine-friendly identifier
  label: string;        // display label in UI
  descricao?: string;   // optional long description
}

export interface IndicadoresConfigResponse {
  fonte: string;                 // data source or provenance
  moeda: string;                 // currency code
  updatedAt: string;             // ISO timestamp of last update
  categorias: IndicadorCategoriaConfig[];
  colunas: {
    base: { media: string; indice: string }; // labels for base state columns
    comparado: { indice: string; media: string }; // order we show when comparison exists
    caption: string; // table caption
  };
}

export const MOCK_INDICADORES_CONFIG: IndicadoresConfigResponse = {
  fonte: "Mudacity DataLab (simulado)",
  moeda: "BRL",
  updatedAt: new Date().toISOString(),
  categorias: [
    { id: "alimentacao", label: "Alimentação", descricao: "Custos médios com alimentação" },
    { id: "saude", label: "Saúde", descricao: "Indicadores relativos a saúde" },
    { id: "aluguel", label: "Aluguél", descricao: "Custos e índice de aluguél" },
  ],
  colunas: {
    base: { media: "Média (R$)", indice: "Índice Nacional" },
    comparado: { indice: "Índice Nacional", media: "Média (R$)" },
    caption: "* Valores mensais estimados (dados simulados).",
  },
};
