"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface EstadoItem {
  uf: string;
  nome: string;
}

export interface EstadoSearchProps {
  value?: EstadoItem | null;
  onChange?: (item: EstadoItem | null) => void;
  placeholder?: string;
  disabled?: boolean;
  inputTestId?: string;
}

export function EstadoSearch({
  value,
  onChange,
  placeholder = "Nome do Estado",
  disabled,
  inputTestId = "estado-pesquisa-input",
}: EstadoSearchProps) {
  const [query, setQuery] = useState(value?.nome || "");
  const [items, setItems] = useState<EstadoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const controllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const fetchEstados = useCallback(async (q: string) => {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("limit", "10");
      const res = await fetch(`/api/estados?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Erro ao buscar estados");
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      if ((e as any)?.name !== "AbortError") {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce query changes
  useEffect(() => {
    if (value && query === value.nome) return; // skip initial when selecting
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query) {
      setItems([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchEstados(query);
    }, 300);
  }, [query, fetchEstados, value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(item: EstadoItem) {
    setQuery(item.nome);
    setOpen(false);
    onChange?.(item);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setOpen(!!val);
    onChange?.(null); // reset selection when typing
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(items.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      if (highlight >= 0 && items[highlight]) {
        e.preventDefault();
        handleSelect(items[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <Input
        value={query}
        placeholder={placeholder}
        onChange={handleInputChange}
        disabled={disabled}
        onFocus={() => query && setOpen(true)}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        autoComplete="off"
        data-test-id={inputTestId}
      />
      {open && (items.length > 0 || loading) && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-white shadow-md max-h-60 overflow-auto text-sm">
          {loading && (
            <div className="px-3 py-2 text-muted-foreground">Carregando...</div>
          )}
          {!loading && items.length === 0 && (
            <div className="px-3 py-2 text-muted-foreground">Nenhum resultado</div>
          )}
          {!loading && items.map((item, i) => (
            <button
              type="button"
              key={item.uf}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                highlight === i && "bg-gray-100"
              )}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => {
                // prevent blur
                e.preventDefault();
              }}
              onClick={() => handleSelect(item)}
            >
              <span className="font-mono text-xs text-gray-500 w-10">{item.uf}</span>
              <span>{item.nome}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EstadoSearch;
