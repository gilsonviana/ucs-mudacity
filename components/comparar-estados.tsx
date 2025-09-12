"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import EstadoSearch, { type EstadoItem } from "@/components/estado-search";

/**
 * Renders a toggle button that, when clicked, shows the EstadoSearch component below it.
 * Keeps selected value locally (can be lifted later if needed).
 */
export interface CompararEstadosProps {
  onSelect?: (estado: EstadoItem | null) => void;
  selected?: EstadoItem | null;
  disabledUFs?: string[]; // optionally prevent selecting certain UFs (e.g., current page)
  onOpenChange?: (open: boolean) => void;
}

export function CompararEstados({
  onSelect,
  selected,
  disabledUFs = [],
  onOpenChange,
}: CompararEstadosProps) {
  const [open, setOpen] = useState(false);
  const [estado, setEstado] = useState<EstadoItem | null>(selected ?? null);

  return (
    <div className="space-y-4">
      <Button
        data-test-id="comparar-estados-button"
        variant="outline"
        onClick={() => {
          if (open) {
            setEstado(null);
            onSelect?.(null);
          }
          setOpen((o) => {
            const next = !o;
            onOpenChange?.(next);
            return next;
          });
        }}
      >
        {open ? "Limpar comparação" : "Comparar Estados"}
      </Button>
      {open && (
        <div className="max-w-sm">
          <EstadoSearch
            value={estado ?? undefined}
            onChange={(item) => {
              // prevent selecting a disabled UF
              if (item && disabledUFs.includes(item.uf)) return;
              setEstado(item);
              onSelect?.(item);
            }}
            placeholder="Selecione outro Estado"
            inputTestId="comparar-estado-search-input"
          />
        </div>
      )}
    </div>
  );
}

export default CompararEstados;
