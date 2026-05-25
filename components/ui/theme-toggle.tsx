"use client";

import { useTheme } from "next-themes";
import { Moon02Icon, Sun01Icon } from "hugeicons-react";

import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle dark and light mode"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border border-border bg-foreground/[0.04] text-foreground transition-colors hover:border-violet-400/40 hover:text-violet-300",
        className,
      )}
    >
      <Moon02Icon className="hidden size-4 dark:block" />
      <Sun01Icon className="block size-4 dark:hidden" />
    </button>
  );
}
