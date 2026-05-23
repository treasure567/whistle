import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  hoverGlow?: boolean;
  innerHighlight?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

const PADDING_CLASSES: Record<NonNullable<GlowCardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function GlowCard({
  children,
  className,
  padding = "md",
}: GlowCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[#111113] transition-colors duration-200 hover:border-white/20",
        PADDING_CLASSES[padding],
        className,
      )}
    >
      <div className="relative">{children}</div>
    </div>
  );
}
