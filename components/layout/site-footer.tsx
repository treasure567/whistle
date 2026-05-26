import Link from "next/link";

import { WhistleMark } from "@/components/ui/whistle-mark";
import { CONTRACT_LIST } from "@/lib/contracts";
import { truncateAddress, explorerAddressUrl } from "@/lib/format";

export function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-border bg-muted/40 dark:border-white/5 dark:bg-[#050507]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <WhistleMark size={32} className="text-violet-500 dark:text-violet-300" />
              <span className="font-mono text-base tracking-tight text-foreground">whistle</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Three AI helpers for every World Cup match. You pick who to back — they do the work.
            </p>
          </div>

          <div className="md:text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
              Contracts · X Layer
            </p>
            <ul className="mt-3 space-y-2">
              {CONTRACT_LIST.map((c) => (
                <li key={c.name}>
                  <Link
                    href={explorerAddressUrl(c.address)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-baseline gap-3 font-mono text-[11px] text-muted-foreground transition-colors hover:text-violet-400 dark:hover:text-violet-300"
                  >
                    <span className="uppercase tracking-[0.14em]">{c.name}</span>
                    <span>{truncateAddress(c.address, 4)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 text-[11px] text-muted-foreground/80 dark:border-white/5 md:flex-row md:items-center md:justify-between">
          <p className="font-mono">© 2026 whistle</p>
          <div className="flex items-center gap-6 font-mono uppercase tracking-[0.18em]">
            <Link href="/activity" className="transition-colors hover:text-foreground">
              Activity
            </Link>
            <Link href="/leaderboard" className="transition-colors hover:text-foreground">
              Leaderboard
            </Link>
            <a
              href="https://www.oklink.com/xlayer"
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-foreground"
            >
              Explorer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
