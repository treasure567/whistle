"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowDown01Icon, Search01Icon } from "hugeicons-react";

import { FlagOrb } from "@/components/ui/flag-orb";
import { cn } from "@/lib/utils";

export type CountryOption = { code: string; name: string };

export function CountryPicker({
  value,
  options,
  onChange,
  exclude,
  placeholder = "Search countries",
  className,
  disabled,
}: {
  value: string;
  options: CountryOption[];
  onChange: (code: string) => void;
  exclude?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.code === value) ?? null;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options
      .filter((o) => o.code !== exclude)
      .filter((o) => !q || o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q))
      .slice(0, 80);
  }, [options, exclude, query]);

  function choose(code: string) {
    onChange(code);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen((v) => !v);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-foreground/[0.02] px-3 py-2 text-left transition-colors hover:border-violet-400/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {selected ? <FlagOrb code={selected.code} size={26} /> : null}
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{selected?.name ?? "Select a country"}</span>
        <ArrowDown01Icon size={16} className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search01Icon size={14} className="shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                  if (e.key === "Enter" && filtered[0]) {
                    e.preventDefault();
                    choose(filtered[0].code);
                  }
                }}
                placeholder={placeholder}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  No matches
                </p>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.code}
                    type="button"
                    onClick={() => choose(o.code)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-violet-500/[0.08]",
                      o.code === value ? "text-violet-600 dark:text-violet-200" : "text-foreground",
                    )}
                  >
                    <FlagOrb code={o.code} size={22} />
                    <span className="min-w-0 flex-1 truncate">{o.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{o.code}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
