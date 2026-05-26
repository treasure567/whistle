"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight01Icon, ChampionIcon, RefreshIcon } from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/ui/connect-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useMyTeam } from "@/hooks/use-my-team";
import { ApiError } from "@/lib/api/client";
import { fetchLeaderboard, joinLeague } from "@/lib/api/leagues";
import type { LeaderboardRowRecord } from "@/lib/api/schemas";
import { truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

interface LeagueStandingsProps {
  leagueId: string;
  token?: string;
  initialRows: LeaderboardRowRecord[];
}

export function LeagueStandings({ leagueId, token, initialRows }: LeagueStandingsProps) {
  const { team, address } = useMyTeam();
  const [rows, setRows] = useState<LeaderboardRowRecord[]>(initialRows);
  const [refreshing, setRefreshing] = useState(false);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function refresh() {
    setRefreshing(true);
    setRows(await fetchLeaderboard(leagueId));
    setRefreshing(false);
  }

  async function join() {
    if (!team) return;
    setJoining(true);
    setMessage(null);
    try {
      await joinLeague(leagueId, token ? { teamId: team.id, accessToken: token } : { teamId: team.id });
      setMessage({ kind: "ok", text: "You joined this league" });
      await refresh();
    } catch (err) {
      setMessage({ kind: "err", text: err instanceof ApiError ? err.message : "Could not join" });
    } finally {
      setJoining(false);
    }
  }

  const alreadyIn = rows.some((row) => row.ownerAddress.toLowerCase() === address?.toLowerCase());

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 md:px-10">
      <JoinPanel
        connected={Boolean(address)}
        hasTeam={Boolean(team)}
        alreadyIn={alreadyIn}
        joining={joining}
        message={message}
        onJoin={join}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Standings · {rows.length}
          </span>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            aria-label="Refresh standings"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <RefreshIcon size={12} className={cn(refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            className="m-4"
            icon={<ChampionIcon size={16} />}
            label="NO_TEAMS_YET"
            hint="No one has joined this league. Join with your team to claim the top spot."
          />
        ) : (
          rows.map((row, index) => {
            const mine = row.ownerAddress.toLowerCase() === address?.toLowerCase();
            return (
              <motion.div
                key={row.teamId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.03 }}
                className={cn(
                  "grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-border px-5 py-3.5 last:border-b-0",
                  mine && "bg-violet-500/[0.05]",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-sm tabular-nums",
                    row.rank <= 3 ? "text-violet-500 dark:text-violet-300" : "text-muted-foreground",
                  )}
                >
                  {String(row.rank).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    {row.teamName}
                    {mine ? <span className="ml-2 text-[11px] text-violet-500 dark:text-violet-300">you</span> : null}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {truncateAddress(row.ownerAddress, 4)}
                  </p>
                </div>
                <span className="font-mono text-base tabular-nums text-foreground">
                  {row.points}
                  <span className="ml-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">pts</span>
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function JoinPanel({
  connected,
  hasTeam,
  alreadyIn,
  joining,
  message,
  onJoin,
}: {
  connected: boolean;
  hasTeam: boolean;
  alreadyIn: boolean;
  joining: boolean;
  message: { kind: "ok" | "err"; text: string } | null;
  onJoin: () => void;
}) {
  if (!connected) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <p className="text-[13px] text-muted-foreground">Connect your wallet to join this league.</p>
        <ConnectButton compact />
      </div>
    );
  }
  if (!hasTeam) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
        <p className="text-[13px] text-amber-700 dark:text-amber-100">You need a team before joining.</p>
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
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <div>
        <p className="text-[13px] text-muted-foreground">
          {alreadyIn ? "Your team is in this league." : "Add your team to this league."}
        </p>
        {message ? (
          <p
            className={cn(
              "mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em]",
              message.kind === "ok" ? "text-emerald-600 dark:text-emerald-300" : "text-red-600 dark:text-red-300",
            )}
          >
            {message.text}
          </p>
        ) : null}
      </div>
      <Button variant="violet" size="sm" onClick={onJoin} disabled={joining || alreadyIn}>
        {joining ? "Joining" : alreadyIn ? "Joined" : "Join league"}
      </Button>
    </div>
  );
}
