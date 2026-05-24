import Link from "next/link";
import { Github01Icon, NewTwitterIcon, BookOpen01Icon } from "hugeicons-react";

import { XdevMark } from "@/components/ui/xdev-mark";
import { CONTRACT_LIST } from "@/lib/contracts";
import { truncateAddress, explorerAddressUrl } from "@/lib/format";

const LINK_COLUMNS = [
  {
    title: "Agents",
    links: [
      { label: "The Scout", href: "/agents/scout" },
      { label: "The Bookie", href: "/agents/bookie" },
      { label: "The Manager", href: "/agents/manager" },
      { label: "Allocate capital", href: "/allocate" },
    ],
  },
  {
    title: "Onchain",
    links: [
      { label: "Activity ledger", href: "/activity" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "X Layer explorer", href: "https://www.oklink.com/xlayer" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Architecture", href: "#" },
      { label: "Brand", href: "#" },
      { label: "GitHub", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Disclaimers", href: "#" },
      { label: "Hackathon submission", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/5 bg-[#050507]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <XdevMark size={36} className="text-violet-300" />
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-lg tracking-tight text-zinc-100">xdev</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  agent stable
                </span>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Three onchain agents. Every World Cup match. Acting on X Layer.
              The user is the allocator, not the picker.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                X Layer · chainId 196
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-violet-200">
                <span className="size-1.5 animate-pulse rounded-full bg-violet-400" />
                OKX X Cup
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-8 md:grid-cols-4">
            {LINK_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-300 transition-colors hover:text-violet-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-white/5 bg-[#0B0B0E] p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Contracts deployed · X Layer mainnet
            </p>
            <span className="font-mono text-[10px] text-emerald-300">5 / 5 verified</span>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-5">
            {CONTRACT_LIST.map((c) => (
              <Link
                key={c.name}
                href={explorerAddressUrl(c.address)}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex flex-col gap-1 rounded-xl border border-white/5 bg-[#111113] p-3 transition-colors hover:border-violet-400/30"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 group-hover:text-violet-200">
                  {c.name}
                </span>
                <span className="font-mono text-[11px] text-zinc-300">
                  {truncateAddress(c.address, 4)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/5 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[11px] text-muted-foreground">
            © 2026 xdev. Three agents. One book.
          </p>
          <div className="flex items-center gap-2">
            {[
              { icon: BookOpen01Icon, href: "#", label: "Docs" },
              { icon: NewTwitterIcon, href: "#", label: "X" },
              { icon: Github01Icon, href: "#", label: "GitHub" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-500 transition-colors hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
              >
                <Icon className="size-3.5" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
