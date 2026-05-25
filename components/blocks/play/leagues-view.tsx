"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight01Icon, Globe02Icon, SquareLock02Icon, UserGroupIcon } from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/ui/connect-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useMyTeam } from "@/hooks/use-my-team";
import { ApiError } from "@/lib/api/client";
import { joinLeague } from "@/lib/api/leagues";
import type { LeagueRecord } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { CreateLeagueForm } from "./create-league-form";

type RowMessage = { kind: "ok" | "err"; text: string };

export function LeaguesView({ initialLeagues }: { initialLeagues: LeagueRecord[] }) {
  const { team, address } = useMyTeam();
  const [leagues, setLeagues] = useState<LeagueRecord[]>(initialLeagues);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, RowMessage>>({});

  async function join(league: LeagueRecord) {
    if (!team) return;
    setBusyId(league.id);
    setMessages((prev) => ({ ...prev, [league.id]: { kind: "ok", text: "" } }));
    try {
      await joinLeague(league.id, { teamId: team.id });
      setMessages((prev) => ({ ...prev, [league.id]: { kind: "ok", text: "Joined" } }));
    } catch (err) {
      const text = err instanceof ApiError ? err.message : "Could not join";
      setMessages((prev) => ({ ...prev, [league.id]: { kind: "err", text } }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl items-start gap-6 px-6 md:grid-cols-[1fr_1.3fr] md:px-10">
      <div className="flex flex-col gap-4">
        <TeamBanner address={address} teamName={team?.name ?? null} />
        <CreateLeagueForm
          address={address}
          onCreated={(league) => setLeagues((prev) => [league, ...prev])}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Public leagues · {leagues.length}
        </h2>
        {leagues.length === 0 ? (
          <EmptyState
            icon={<Globe02Icon size={16} />}
            label="NO_PUBLIC_LEAGUES"
            hint="Be the first to start one. Create a public league and share it with friends."
          />
        ) : (
          leagues.map((league) => (
            <LeagueRow
              key={league.id}
              league={league}
              canJoin={Boolean(team)}
              busy={busyId === league.id}
              message={messages[league.id]}
              onJoin={() => join(league)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TeamBanner({ address, teamName }: { address: string | undefined; teamName: string | null }) {
  if (!address) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0B0B0E] p-4">
        <p className="text-[13px] text-zinc-400">Connect your wallet to create or join leagues.</p>
        <ConnectButton compact />
      </div>
    );
  }
  if (!teamName) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
        <p className="text-[13px] text-amber-100">Build a team before you join a league.</p>
        <Link href="/play/team">
          <Button variant="outline" size="sm">
            Pick your team
            <ArrowRight01Icon size={14} />
          </Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
      <UserGroupIcon size={16} className="text-emerald-300" />
      <p className="text-[13px] text-emerald-100">
        Playing as <span className="font-medium">{teamName}</span>
      </p>
    </div>
  );
}

function LeagueRow({
  league,
  canJoin,
  busy,
  message,
  onJoin,
}: {
  league: LeagueRecord;
  canJoin: boolean;
  busy: boolean;
  message: RowMessage | undefined;
  onJoin: () => void;
}) {
  const isPrivate = league.kind === "PRIVATE";
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0B0B0E] p-5 transition-colors hover:border-white/20 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl border",
            isPrivate ? "border-white/10 text-zinc-400" : "border-violet-500/30 text-violet-300",
          )}
        >
          {isPrivate ? <SquareLock02Icon size={16} /> : <Globe02Icon size={16} />}
        </span>
        <div>
          <p className="text-sm font-medium text-zinc-100">{league.name}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            {league.maxBudgetMillions.toFixed(0)}m budget · {league.transferDeadlineMinutes}m deadline
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {message?.text ? (
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.18em]",
              message.kind === "ok" ? "text-emerald-300" : "text-red-300",
            )}
          >
            {message.text}
          </span>
        ) : null}
        <Link href={`/play/leagues/${league.id}?name=${encodeURIComponent(league.name)}`}>
          <Button variant="ghost" size="sm">
            Standings
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={onJoin} disabled={!canJoin || busy}>
          {busy ? "Joining" : "Join"}
        </Button>
      </div>
    </div>
  );
}
