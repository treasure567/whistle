import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StatBlockProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  delta?: ReactNode;
  className?: string;
  align?: "left" | "right";
}

export function StatBlock({ label, value, hint, delta, className, align = "left" }: StatBlockProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        align === "right" && "items-end text-right",
        className,
      )}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-2xl text-foreground tracking-tight tabular-nums">
        {value}
      </span>
      <div className="flex items-center gap-2">
        {delta ? (
          <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-300 tabular-nums">{delta}</span>
        ) : null}
        {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  );
}
