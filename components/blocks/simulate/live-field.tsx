"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

// 4-3-3 base positions for the home side (attacking left to right), in pitch %.
const HOME_FORM: { x: number; y: number }[] = [
  { x: 6, y: 50 },
  { x: 20, y: 16 },
  { x: 20, y: 38 },
  { x: 20, y: 62 },
  { x: 20, y: 84 },
  { x: 37, y: 26 },
  { x: 37, y: 50 },
  { x: 37, y: 74 },
  { x: 48, y: 24 },
  { x: 48, y: 50 },
  { x: 48, y: 76 },
];
const AWAY_FORM = HOME_FORM.map((p) => ({ x: 100 - p.x, y: p.y }));

function clamp(n: number): number {
  return Math.max(3, Math.min(97, n));
}

// Gentle deterministic wander so the icons keep shifting each minute.
function wander(seed: number, minute: number, amp: number): number {
  return Math.sin(minute * 0.55 + seed * 1.7) * amp + Math.cos(minute * 0.33 + seed) * amp * 0.4;
}

// Flat top-down pitch whose player icons drift toward the ball and wander as the
// match plays, driven by the live ball position and the current minute.
export function LiveField({ ballX, minute }: { ballX: number; minute: number }) {
  const drift = (ballX - 50) * 0.4; // both teams shift toward the play
  const ballY = clamp(50 + wander(99, minute, 10));

  return (
    <div className="relative h-48 w-full overflow-hidden bg-[linear-gradient(90deg,#0e7a44,#10532f_50%,#0e7a44)] sm:h-56">
      <div className="pointer-events-none absolute inset-2 rounded border border-white/20" />
      <div className="pointer-events-none absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-white/20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      <div className="pointer-events-none absolute inset-y-2 left-2 w-10 rounded-l border border-r-0 border-white/20" />
      <div className="pointer-events-none absolute inset-y-2 right-2 w-10 rounded-r border border-l-0 border-white/20" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={cn("pointer-events-none absolute inset-y-0", i % 2 === 0 && "bg-white/[0.03]")}
          style={{ left: `${(i / 8) * 100}%`, width: `${100 / 8}%` }}
        />
      ))}

      {HOME_FORM.map((p, i) => (
        <Dot
          key={`h${i}`}
          x={clamp(p.x + drift + wander(i, minute, 2.4))}
          y={clamp(p.y + wander(i + 5, minute, 3))}
          color="bg-violet-500"
        />
      ))}
      {AWAY_FORM.map((p, i) => (
        <Dot
          key={`a${i}`}
          x={clamp(p.x + drift + wander(i + 20, minute, 2.4))}
          y={clamp(p.y + wander(i + 25, minute, 3))}
          color="bg-zinc-200"
        />
      ))}

      <motion.div
        className="absolute z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
        animate={{ left: `${ballX}%`, top: `${ballY}%` }}
        transition={{ type: "spring", stiffness: 130, damping: 15 }}
      />
    </div>
  );
}

function Dot({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <motion.div
      className={cn("absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-black/30", color)}
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={{ type: "spring", stiffness: 55, damping: 13 }}
    />
  );
}
