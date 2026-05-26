"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion } from "motion/react";
import {
  Cancel01Icon,
  Logout01Icon,
  Wallet01Icon,
  Copy01Icon,
  Tick02Icon,
  ArrowUpRight01Icon,
  Settings02Icon,
} from "hugeicons-react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";

import { Button } from "@/components/ui/button";
import { useOkbBalance } from "@/hooks/use-okb-balance";
import { useWhstBalance } from "@/hooks/use-whst-balance";
import { truncateAddress, explorerAddressUrl } from "@/lib/format";
import { xLayer } from "@/lib/chains";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 380, damping: 32 };

export function ConnectButton({ compact = false }: { compact?: boolean }) {
  const { address, isConnected, status } = useAccount();
  const [open, setOpen] = useState(false);

  if (status === "connecting" || status === "reconnecting") {
    return (
      <Button variant="outline" size={compact ? "sm" : "default"} disabled>
        <span className="dot-live dot-live--idle" style={{ position: "static", width: 6, height: 6 }} />
        Connecting…
      </Button>
    );
  }

  if (isConnected && address) {
    return <ConnectedMenu address={address} compact={compact} />;
  }

  return (
    <>
      <Button
        variant="violet"
        size={compact ? "sm" : "default"}
        onClick={() => setOpen(true)}
      >
        <Wallet01Icon size={14} />
        Connect
      </Button>
      <ConnectDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function ConnectedMenu({ address, compact }: { address: string; compact: boolean }) {
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const chainId = useChainId();
  const { balance: okb } = useOkbBalance();
  const { balance: whst } = useWhstBalance();
  const [copied, setCopied] = useState(false);
  const onCorrectChain = chainId === xLayer.id;

  function copy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {onCorrectChain && whst !== null ? (
        <span
          className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-foreground sm:flex"
          title="Your WHST balance — the token you fund agents and bet with"
        >
          <span className="size-1.5 rounded-full bg-violet-400" />
          {whst.toLocaleString(undefined, { maximumFractionDigits: 2 })} WHST
        </span>
      ) : null}
      {onCorrectChain && okb !== null ? (
        <span
          className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-foreground md:flex"
          title="Your native OKB balance (gas) on X Layer testnet"
        >
          <span className="size-1.5 rounded-full bg-emerald-400" />
          {okb.toLocaleString(undefined, { maximumFractionDigits: 4 })} OKB
        </span>
      ) : null}
      {!onCorrectChain ? (
        <Button
          variant="violet"
          size={compact ? "sm" : "default"}
          onClick={() => switchChain({ chainId: xLayer.id })}
          disabled={isSwitching}
        >
          {isSwitching ? "Adding X Layer…" : "Switch to X Layer"}
        </Button>
      ) : null}
      <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button variant="outline" size={compact ? "sm" : "default"} className="gap-2">
          <span
            className={cn(
              "dot-live",
              onCorrectChain ? "dot-live--ok" : "dot-live--idle",
            )}
            style={{ position: "static", width: 6, height: 6 }}
          />
          <span className="font-mono normal-case tracking-normal">
            {truncateAddress(address)}
          </span>
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          sideOffset={8}
          align="end"
          className="z-50 w-64 rounded-2xl border border-border bg-card/95 p-2 backdrop-blur-xl"
        >
          <div className="px-3 py-3 border-b border-border">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Connected
            </p>
            <p className="mt-1 font-mono text-sm text-foreground">
              {truncateAddress(address, 6)}
            </p>
          </div>
          <MenuRow
            icon={copied ? <Tick02Icon size={14} className="text-emerald-600 dark:text-emerald-300" /> : <Copy01Icon size={14} />}
            label={copied ? "Copied" : "Copy address"}
            onSelect={(e) => {
              e.preventDefault();
              copy();
            }}
          />
          <MenuRow
            icon={<ArrowUpRight01Icon size={14} />}
            label="View on OKLink"
            asLink={explorerAddressUrl(address)}
          />
          <MenuRow
            icon={<Settings02Icon size={14} />}
            label="Manage spending limits"
            asLink="/dashboard#sessions"
          />
          <div className="my-1 h-px bg-foreground/5" />
          <MenuRow
            icon={<Logout01Icon size={14} />}
            label="Disconnect"
            danger
            onSelect={() => disconnect()}
          />
        </Dropdown.Content>
      </Dropdown.Portal>
      </Dropdown.Root>
    </div>
  );
}

function MenuRow({
  icon,
  label,
  onSelect,
  asLink,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onSelect?: (event: Event) => void;
  asLink?: string;
  danger?: boolean;
}) {
  const className = cn(
    "flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] tracking-wide transition-colors data-[highlighted]:bg-foreground/5",
    danger
      ? "text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200"
      : "text-muted-foreground hover:text-foreground",
  );

  if (asLink) {
    return (
      <Dropdown.Item asChild>
        <a href={asLink} target="_blank" rel="noreferrer noopener" className={className}>
          {icon}
          {label}
        </a>
      </Dropdown.Item>
    );
  }

  return (
    <Dropdown.Item onSelect={onSelect} className={className}>
      {icon}
      {label}
    </Dropdown.Item>
  );
}

function ConnectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { connectors, connect, isPending, variables } = useConnect();
  const pendingConnectorUid =
    isPending && variables?.connector && "uid" in variables.connector
      ? (variables.connector as { uid: string }).uid
      : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={spring}
                className="fixed left-1/2 top-1/2 z-50 w-[min(420px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card/95 p-6 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
                      Connect to Whistle
                    </p>
                    <Dialog.Title className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                      Choose a wallet
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                      Fund AI helpers for World Cup matches.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      aria-label="Close"
                      className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    >
                      <Cancel01Icon size={14} />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  {connectors.map((connector) => {
                    const isPendingThis = pendingConnectorUid === connector.uid;
                    return (
                      <button
                        key={connector.uid}
                        type="button"
                        disabled={isPending}
                        onClick={() => connect({ connector })}
                        className={cn(
                          "group flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 text-left transition-all",
                          "hover:border-violet-400/40 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted text-violet-500 dark:text-violet-300">
                            <Wallet01Icon size={16} />
                          </span>
                          <span className="flex flex-col">
                            <span className="text-sm text-foreground">{labelFor(connector.name)}</span>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                              {hintFor(connector.name)}
                            </span>
                          </span>
                        </span>
                        {isPendingThis ? (
                          <span className="font-mono text-[10px] uppercase tracking-widest text-violet-500 dark:text-violet-300">
                            …signing
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-violet-500 dark:group-hover:text-violet-200">
                            connect
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
                  By connecting, you agree to bounded session-key delegation per match. Whistle never custodies funds.
                </p>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function labelFor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("okx")) return "OKX Wallet";
  if (n.includes("coinbase")) return "Coinbase Wallet";
  if (n.includes("walletconnect")) return "WalletConnect";
  if (n.includes("injected") || n.includes("metamask") || n.includes("browser")) {
    return "Browser Wallet";
  }
  return name;
}

function hintFor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("okx")) return "Recommended · X Layer";
  if (n.includes("coinbase")) return "Smart wallet";
  if (n.includes("walletconnect")) return "Mobile QR";
  return "Browser extension";
}
