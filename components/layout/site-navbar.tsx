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
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { WhistleMark } from "@/components/ui/whistle-mark";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Fixtures", href: "/fixtures" },
  { label: "Simulate", href: "/simulate" },
  { label: "Manager", href: "/manager" },
  { label: "Mint", href: "/mint" },
  { label: "Fund", href: "/allocate" },
  { label: "Play", href: "/play" },
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
          maxWidth: scrolled ? 1240 : 1440,
          marginTop: scrolled ? 14 : 0,
          borderRadius: scrolled ? 999 : 0,
          paddingLeft: scrolled ? 10 : 0,
          paddingRight: scrolled ? 10 : 0,
        }}
        transition={spring}
        className={cn(
          "relative overflow-hidden border backdrop-blur-2xl",
          scrolled
            ? "border-border bg-background/90 dark:border-white/10 dark:bg-[rgba(10,10,10,0.82)]"
            : "border-transparent border-b-border bg-background/90 dark:border-b-white/5 dark:bg-background/80",
        )}
      >

        <div
          className={cn(
            "relative flex items-center justify-between transition-[height,padding] duration-300",
            scrolled ? "h-14 px-5 md:px-6" : "h-16 px-6 md:px-10",
          )}
        >
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="whistle home">
            <WhistleMark size={28} className="text-violet-500 dark:text-violet-300" />
            <span className="font-mono text-base tracking-tight text-foreground">whistle</span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[13px] font-medium tracking-tight transition-all duration-200",
                    isActive
                      ? "bg-foreground/[0.06] text-foreground"
                      : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <ConnectButton compact />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-foreground/5 text-foreground xl:hidden"
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
            className="mx-4 mt-2 w-[calc(100%-2rem)] max-w-[880px] overflow-hidden rounded-2xl border border-border bg-popover/95 backdrop-blur-2xl dark:border-white/10 dark:bg-[rgba(10,10,10,0.92)] xl:hidden"
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
                    className="block rounded-lg px-3 py-2.5 text-[15px] font-medium tracking-tight text-foreground/80 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
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
