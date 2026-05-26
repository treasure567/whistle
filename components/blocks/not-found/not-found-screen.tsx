"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  FileNotFoundIcon,
} from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { WhistleMark } from "@/components/ui/whistle-mark";

const spring = { type: "spring" as const, stiffness: 320, damping: 32 };

const QUICK_LINKS = [
  { label: "Agents", href: "/agents" },
  { label: "Fund", href: "/allocate" },
  { label: "Activity", href: "/activity" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Dashboard", href: "/dashboard" },
] as const;

export function NotFoundScreen() {
  return (
    <section className="relative flex flex-1 items-center overflow-hidden pt-[calc(4rem+2rem)] pb-16 md:pt-32 md:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto w-full max-w-3xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.04 }}
          className="flex flex-col items-start"
        >
          <div className="flex items-center gap-3">
            <WhistleMark size={28} className="text-violet-500 dark:text-violet-300" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
              Route not found
            </span>
          </div>

          <p
            aria-hidden
            className="mt-8 font-mono text-[clamp(5rem,18vw,9rem)] leading-none tracking-tighter text-foreground/[0.04]"
          >
            404
          </p>

          <div className="mt-2 flex size-12 items-center justify-center rounded-full border border-border bg-foreground/[0.04] text-violet-500 dark:text-violet-200">
            <FileNotFoundIcon size={20} strokeWidth={1.5} />
          </div>

          <h1 className="mt-6 max-w-xl text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
            This page isn&apos;t on the pitch.
          </h1>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            <span className="font-serif-italic text-violet-500 dark:text-violet-200">
              Wrong turn somewhere.
            </span>{" "}
            The URL doesn&apos;t match anything on whistle — head back or pick
            a destination below.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/">
              <Button variant="violet" size="pill">
                <ArrowLeft01Icon size={14} />
                Back home
              </Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline" size="pill">
                Meet the team
                <ArrowRight01Icon size={14} />
              </Button>
            </Link>
          </div>

          <div className="mt-10 w-full border-t border-border pt-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Try one of these
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.12 + i * 0.04 }}
                >
                  <Link
                    href={link.href}
                    className="inline-flex rounded-full border border-border bg-foreground/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-foreground/[0.08] hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            ERR_404 · ROUTE_NOT_FOUND
          </p>
        </motion.div>
      </div>
    </section>
  );
}
