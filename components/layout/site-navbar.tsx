"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { Menu03Icon } from "hugeicons-react";

import { ConnectButton } from "@/components/ui/connect-button";
import { XdevMark } from "@/components/ui/xdev-mark";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Agents", href: "/agents" },
  { label: "Allocate", href: "/allocate" },
  { label: "Activity", href: "/activity" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Dashboard", href: "/dashboard" },
];

const spring = { type: "spring" as const, stiffness: 260, damping: 32 };

export function SiteNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex flex-col items-center">
      <motion.div
        initial={false}
        animate={{
          width: scrolled ? "94%" : "100%",
          maxWidth: scrolled ? 1080 : 1440,
          marginTop: scrolled ? 14 : 0,
          borderRadius: scrolled ? 999 : 0,
          paddingLeft: scrolled ? 10 : 0,
          paddingRight: scrolled ? 10 : 0,
        }}
        transition={spring}
        className={cn(
          "relative overflow-hidden border backdrop-blur-2xl",
          scrolled
            ? "border-white/10 bg-[rgba(10,10,10,0.7)]"
            : "border-transparent border-b-white/5 bg-background/70",
        )}
      >

        <div
          className={cn(
            "relative flex items-center justify-between transition-[height,padding] duration-300",
            scrolled ? "h-14 px-5 md:px-6" : "h-16 px-6 md:px-10",
          )}
        >
          <Link href="/" className="group flex items-center gap-3" aria-label="xdev home">
            <XdevMark size={28} className="text-violet-300" />
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-base tracking-tight text-zinc-100">xdev</span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:inline">
                agent stable
              </span>
            </div>
            <span className="ml-1 hidden items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/[0.06] px-2.5 py-[3px] md:inline-flex">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-violet-400 opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-violet-400" />
              </span>
              <span className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-violet-200">
                X Layer
              </span>
            </span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-tight transition-all duration-200",
                    isActive
                      ? "bg-white/[0.06] text-white"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ConnectButton compact />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-foreground md:hidden"
            >
              <Menu03Icon className="size-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-drawer"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="mx-4 mt-2 w-[calc(100%-2rem)] max-w-[880px] overflow-hidden rounded-2xl border border-white/10 bg-[rgba(10,10,10,0.92)] backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-1 p-5">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-[15px] font-medium tracking-tight text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
