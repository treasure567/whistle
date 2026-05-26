"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Loading03Icon, MagicWand01Icon, SparklesIcon } from "hugeicons-react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { aiPickSquad, type AiPickStrength } from "@/lib/api/fantasy";
import type { AiPickResult, PlayerRecord } from "@/lib/api/schemas";
import { COUNTRY_FLAGS } from "@/lib/countries";
import { cn } from "@/lib/utils";

const STRENGTHS: ReadonlyArray<{ id: AiPickStrength; label: string; hint: string }> = [
  { id: "balanced", label: "Balanced", hint: "Spread across the pitch" },
  { id: "galacticos", label: "Galácticos", hint: "Spend big on stars" },
  { id: "value", label: "Value", hint: "Cheaper, more depth" },
  { id: "attacking", label: "All-out attack", hint: "Load the front" },
  { id: "defensive", label: "Defensive", hint: "Solid at the back" },
];

const FORMATIONS = ["Auto", "4-4-2", "4-3-3", "3-4-3", "5-4-1"] as const;

type Draft = { playerId: string; starter: boolean; captain: boolean };

export function AiPickPanel({
  players,
  onDraft,
}: {
  players: PlayerRecord[];
  onDraft: (picks: Draft[]) => void;
}) {
  const [strength, setStrength] = useState<AiPickStrength>("balanced");
  const [formation, setFormation] = useState<string>("Auto");
  const [countries, setCountries] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiPickResult | null>(null);

  const teamCodes = useMemo(
    () => Array.from(new Set(players.map((p) => p.teamCode))).sort(),
    [players],
  );

  function toggleCountry(code: string) {
    setCountries((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  async function draft() {
    setBusy(true);
    setError(null);
    try {
      const picked = await aiPickSquad({
        strength,
        ...(countries.size ? { countries: Array.from(countries) } : {}),
        ...(formation !== "Auto" ? { formation } : {}),
      });
      setResult(picked);
      onDraft(picked.picks);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tom couldn't draft a squad. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mb-6 max-w-7xl px-6 md:px-10">
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-4 md:p-5">
        <div className="flex items-center gap-3">
          <AgentAvatar agent="manager" size={40} ring />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-foreground">
              <MagicWand01Icon size={14} className="text-violet-300" />
              Let Tom draft your squad
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Set the brief — Tom fills all 15 + your XI
            </p>
          </div>
          {result ? (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">
              <SparklesIcon size={11} />
              {result.source === "llm" ? "AI pick" : "Tom's model"} · {result.formation}
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4">
          <Field label="Style">
            <div className="flex flex-wrap gap-1.5">
              {STRENGTHS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStrength(s.id)}
                  title={s.hint}
                  className={chip(strength === s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Formation">
            <div className="flex flex-wrap gap-1.5">
              {FORMATIONS.map((f) => (
                <button key={f} type="button" onClick={() => setFormation(f)} className={chip(formation === f)}>
                  {f}
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Countries${countries.size ? ` · ${countries.size}` : " · all"}`}>
            <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto hide-scrollbar">
              {teamCodes.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => toggleCountry(code)}
                  className={chip(countries.has(code))}
                >
                  <span className="mr-1">{COUNTRY_FLAGS[code] ?? "🏳️"}</span>
                  {code}
                </button>
              ))}
            </div>
            {countries.size ? (
              <button
                type="button"
                onClick={() => setCountries(new Set())}
                className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                clear
              </button>
            ) : null}
          </Field>
        </div>

        {error ? (
          <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-[12px] text-red-200">
            {error}
          </p>
        ) : null}

        {result?.rationale ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-[12px] font-serif-italic leading-relaxed text-muted-foreground"
          >
            “{result.rationale}”
          </motion.p>
        ) : null}

        <div className="mt-4 flex items-center gap-3">
          <Button variant="violet" size="sm" onClick={draft} disabled={busy}>
            {busy ? <Loading03Icon size={14} className="animate-spin" /> : <MagicWand01Icon size={14} />}
            {busy ? "Tom is thinking…" : result ? "Re-draft" : "Draft my squad"}
          </Button>
          {result ? (
            <span className="font-mono text-[11px] text-muted-foreground">
              {result.costMillions.toFixed(1)}m used · review and save below
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function chip(active: boolean): string {
  return cn(
    "rounded-full border px-3 py-1.5 text-[12px] transition-colors",
    active
      ? "border-violet-400/50 bg-violet-500/[0.1] text-violet-700 dark:text-violet-100"
      : "border-border text-muted-foreground hover:border-violet-400/30 hover:text-foreground",
  );
}
