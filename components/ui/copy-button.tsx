"use client";

import { useState } from "react";
import { Tick02Icon, Copy01Icon } from "hugeicons-react";

import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  size?: number;
}

export function CopyButton({ value, label, className, size = 12 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label ?? "Copy to clipboard"}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-zinc-400 transition-colors hover:border-violet-400/50 hover:text-zinc-100",
        className,
      )}
    >
      {copied ? (
        <Tick02Icon size={size} className="text-emerald-300" />
      ) : (
        <Copy01Icon size={size} />
      )}
      <span>{copied ? "copied" : "copy"}</span>
    </button>
  );
}
