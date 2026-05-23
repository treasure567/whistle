import Link from "next/link";
import { ArrowUpRight01Icon } from "hugeicons-react";

import { explorerTxUrl, explorerAddressUrl, truncateHash } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TxLinkProps {
  hash: string;
  className?: string;
  chars?: number;
}

export function TxLink({ hash, className, chars = 6 }: TxLinkProps) {
  return (
    <Link
      href={explorerTxUrl(hash)}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "group inline-flex items-center gap-1 font-mono text-[11px] tracking-wide text-zinc-400 transition-colors hover:text-violet-200",
        className,
      )}
    >
      <span>{truncateHash(hash, chars)}</span>
      <ArrowUpRight01Icon size={11} className="-translate-y-px transition-transform group-hover:translate-x-px group-hover:-translate-y-px" />
    </Link>
  );
}

interface AddressLinkProps {
  address: string;
  className?: string;
  chars?: number;
}

export function AddressLink({ address, className, chars = 4 }: AddressLinkProps) {
  return (
    <Link
      href={explorerAddressUrl(address)}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "group inline-flex items-center gap-1 font-mono text-[11px] tracking-wide text-zinc-400 transition-colors hover:text-violet-200",
        className,
      )}
    >
      <span>{`${address.slice(0, chars + 2)}…${address.slice(-chars)}`}</span>
      <ArrowUpRight01Icon size={11} className="-translate-y-px transition-transform group-hover:translate-x-px group-hover:-translate-y-px" />
    </Link>
  );
}
