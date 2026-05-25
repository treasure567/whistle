"use client";

import type { ReactNode } from "react";

// Smooth-scroll (Lenis) was removed: it hijacked the wheel without its required
// stylesheet and trapped scrolling inside the app's nested overflow containers
// (player pool, tables, match lists), so pages couldn't scroll past them.
// Native scrolling is reliable on every page and handles nested scrollers.
export function SmoothScroll({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
