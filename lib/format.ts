import type { Address, Hex } from "viem";

export function truncateAddress(address: Address | string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function truncateHash(hash: Hex | string, chars = 6): string {
  return truncateAddress(hash, chars);
}

const usdtFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatUsdt(amount: number, opts?: { compact?: boolean }): string {
  if (opts?.compact && Math.abs(amount) >= 10_000) {
    return `${compactFormatter.format(amount)} WHST`;
  }
  return `${usdtFormatter.format(amount)} WHST`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatDelta(value: number, suffix = "WHST"): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "±";
  const abs = Math.abs(value);
  return `${sign}${usdtFormatter.format(abs)} ${suffix}`;
}

const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  const absSeconds = Math.abs(diff) / 1000;

  const thresholds: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
    [2592000, "week"],
    [31536000, "month"],
  ];

  for (const [seconds, unit] of thresholds) {
    if (absSeconds < seconds) {
      const value = Math.round(diff / (seconds / divisor(unit)));
      return relativeFormatter.format(value, unit);
    }
  }
  return relativeFormatter.format(Math.round(diff / 31536000_000), "year");
}

function divisor(unit: Intl.RelativeTimeFormatUnit): number {
  switch (unit) {
    case "second":
      return 1;
    case "minute":
      return 60;
    case "hour":
      return 60;
    case "day":
      return 24;
    case "week":
      return 7;
    case "month":
      return 4.34524;
    case "year":
      return 12;
    default:
      return 1;
  }
}

export function formatMatchMinute(minute: number | null): string {
  if (minute === null) return "—";
  if (minute > 90) return `90+${minute - 90}'`;
  if (minute > 45 && minute <= 50) return `45+${minute - 45}'`;
  return `${minute}'`;
}

const EXPLORER_BASE = "https://www.okx.com/web3/explorer/xlayer-test";

export function explorerTxUrl(hash: Hex | string): string {
  return `${EXPLORER_BASE}/tx/${hash}`;
}

export function explorerAddressUrl(address: Address | string): string {
  return `${EXPLORER_BASE}/address/${address}`;
}
