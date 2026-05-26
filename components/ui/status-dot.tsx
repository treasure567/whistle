import { cn } from "@/lib/utils";

type StatusKind = "live" | "ok" | "idle" | "warn";

interface StatusDotProps {
  status?: StatusKind;
  label: string;
  className?: string;
}

const LABEL_CLASS: Record<StatusKind, string> = {
  live: "text-red-600 dark:text-red-300",
  ok: "text-emerald-600 dark:text-emerald-300",
  idle: "text-muted-foreground",
  warn: "text-amber-600 dark:text-amber-300",
};

export function StatusDot({ status = "live", label, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]",
        LABEL_CLASS[status],
        className,
      )}
    >
      <span
        className={cn(
          "dot-live",
          status === "ok" && "dot-live--ok",
          status === "idle" && "dot-live--idle",
          status === "warn" && "dot-live--idle",
        )}
        style={
          status === "warn"
            ? { backgroundColor: "#f59e0b" }
            : undefined
        }
      />
      <span>{label}</span>
    </span>
  );
}
