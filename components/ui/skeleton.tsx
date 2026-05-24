import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/[0.04] border border-white/[0.04]",
        className,
      )}
    />
  );
}
