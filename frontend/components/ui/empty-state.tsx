import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  label: string;
  hint?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ label, hint, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-[#0B0B0E] px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="flex size-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 animate-pulse-glow">
          {icon}
        </div>
      ) : (
        <div
          aria-hidden
          className="dot-live dot-live--idle"
          style={{ position: "static", width: 8, height: 8 }}
        />
      )}
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
        {label}
      </p>
      {hint ? <p className="text-xs text-zinc-500 max-w-sm">{hint}</p> : null}
      {action}
    </div>
  );
}
