"use client";

import { useState } from "react";
import { Globe02Icon, Loading03Icon, SquareLock02Icon } from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ApiError } from "@/lib/api/client";
import { createLeague } from "@/lib/api/leagues";
import type { LeagueRecord } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";

type Kind = "PUBLIC" | "PRIVATE";

const BUDGETS = [80, 100, 120] as const;
const DEADLINES = [
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
] as const;

interface CreateLeagueFormProps {
  address: string | undefined;
  onCreated: (league: LeagueRecord) => void;
}

export function CreateLeagueForm({ address, onCreated }: CreateLeagueFormProps) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Kind>("PUBLIC");
  const [budget, setBudget] = useState<number>(100);
  const [deadline, setDeadline] = useState<number>(60);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<LeagueRecord | null>(null);

  async function submit() {
    if (!address) return;
    setBusy(true);
    setError(null);
    try {
      const league = await createLeague({
        name: name.trim(),
        kind,
        ownerAddress: address,
        maxBudgetMillions: budget,
        transferDeadlineMinutes: deadline,
      });
      setCreated(league);
      setName("");
      onCreated(league);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the league");
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    const shareLink =
      typeof window === "undefined"
        ? ""
        : `${window.location.origin}/play/leagues/${created.id}${created.accessToken ? `?token=${created.accessToken}` : ""}`;
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-violet-500/30 bg-card p-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            League created
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">{created.name}</p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          <span className="truncate font-mono text-[11px] text-muted-foreground">{shareLink}</span>
          <CopyButton value={shareLink} label="Copy share link" />
        </div>
        {created.accessToken ? (
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Access code
            </span>
            <span className="flex items-center gap-2">
              <span className="font-mono text-sm text-foreground">{created.accessToken}</span>
              <CopyButton value={created.accessToken} label="Copy access code" />
            </span>
          </div>
        ) : null}
        <Button variant="outline" size="sm" onClick={() => setCreated(null)}>
          Create another
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="League name"
        aria-label="League name"
        maxLength={60}
        className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-violet-400/50"
      />

      <div className="grid grid-cols-2 gap-2">
        <KindCard
          active={kind === "PUBLIC"}
          onClick={() => setKind("PUBLIC")}
          icon={<Globe02Icon size={16} />}
          title="Public"
          hint="Anyone can find and join"
        />
        <KindCard
          active={kind === "PRIVATE"}
          onClick={() => setKind("PRIVATE")}
          icon={<SquareLock02Icon size={16} />}
          title="Private"
          hint="Invite-only with a code"
        />
      </div>

      <Field label="Budget">
        {BUDGETS.map((value) => (
          <Pill key={value} active={budget === value} onClick={() => setBudget(value)} label={`${value}m`} />
        ))}
      </Field>

      <Field label="Transfer deadline before kickoff">
        {DEADLINES.map((option) => (
          <Pill
            key={option.value}
            active={deadline === option.value}
            onClick={() => setDeadline(option.value)}
            label={option.label}
          />
        ))}
      </Field>

      {error ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-[12px] text-red-600 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <Button
        variant="violet"
        size="lg"
        onClick={submit}
        disabled={!address || name.trim().length === 0 || busy}
      >
        {busy ? <Loading03Icon size={14} className="animate-spin" /> : null}
        {address ? "Create league" : "Connect to create"}
      </Button>
    </div>
  );
}

function KindCard({
  active,
  onClick,
  icon,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 text-left transition-colors",
        active ? "border-violet-400/50 bg-violet-500/[0.06]" : "border-border hover:border-foreground/30",
      )}
    >
      <span className={cn("flex items-center gap-2", active ? "text-violet-500 dark:text-violet-300" : "text-muted-foreground")}>
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </span>
      <span className="text-[12px] text-muted-foreground">{hint}</span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
        active
          ? "border-violet-400/50 bg-violet-500/[0.08] text-violet-700 dark:text-violet-100"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
