import { cn } from "@/lib/utils";

type StatusKind = "live" | "ok" | "idle" | "warn";

interface StatusDotProps {
  status?: StatusKind;
  label: string;
  className?: string;
}

const LABEL_CLASS: Record<StatusKind, string> = {
  live: "text-red-200",
  ok: "text-emerald-200",
  idle: "text-zinc-400",
  warn: "text-amber-200",
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
