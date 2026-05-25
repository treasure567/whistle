"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { UserGroupIcon } from "hugeicons-react";

import { EmptyState } from "@/components/ui/empty-state";
import { useMyTeam } from "@/hooks/use-my-team";
import { ApiError } from "@/lib/api/client";
import { createTeam, updateTeam } from "@/lib/api/fantasy";
import type { FantasyTeamRecord, PlayerRecord } from "@/lib/api/schemas";
import {
  DEFAULT_BUDGET,
  SQUAD_COMPOSITION,
  STARTING_SIZE,
  autoPickStarters,
  countByPosition,
  formationFromStarters,
  validateSquad,
  type SquadSlot,
} from "@/lib/fantasy";
import { PlayerPool } from "./player-pool";
import { SquadBoard } from "./squad-board";
import { ManagerCoach } from "./manager-coach";
import { AiPickPanel } from "./ai-pick-panel";
import { PitchView } from "./pitch-view";

export function TeamBuilder({ players }: { players: PlayerRecord[] }) {
  const { address, isConnected } = useAccount();
  const { team } = useMyTeam();
  const [slots, setSlots] = useState<SquadSlot[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ id: string; cost: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function hydrate(record: FantasyTeamRecord) {
      setSlots(
        record.picks.map((pick) => ({
          player: pick.player,
          starter: pick.starter,
          captain: pick.captain,
        })),
      );
      setName(record.name);
      setTeamId(record.id);
      setHydrated(true);
    }
    if (team && !hydrated && players.length > 0) hydrate(team);
  }, [team, hydrated, players.length]);

  const selectedIds = useMemo(() => new Set(slots.map((slot) => slot.player.id)), [slots]);
  const counts = useMemo(() => countByPosition(slots), [slots]);
  const validation = useMemo(() => validateSquad(slots, DEFAULT_BUDGET), [slots]);
  const remaining = DEFAULT_BUDGET - validation.cost;

  function add(player: PlayerRecord) {
    setError(null);
    setResult(null);
    setSlots((prev) => {
      if (prev.some((slot) => slot.player.id === player.id)) return prev;
      const inPosition = prev.filter((slot) => slot.player.position === player.position).length;
      if (inPosition >= SQUAD_COMPOSITION[player.position]) return prev;
      return [...prev, { player, starter: false, captain: false }];
    });
  }

  function remove(id: string) {
    setResult(null);
    setSlots((prev) => prev.filter((slot) => slot.player.id !== id));
  }

  function toggleStarter(id: string) {
    setSlots((prev) => {
      const starters = prev.filter((slot) => slot.starter).length;
      return prev.map((slot) => {
        if (slot.player.id !== id) return slot;
        if (!slot.starter && starters >= STARTING_SIZE) return slot;
        return { ...slot, starter: !slot.starter };
      });
    });
  }

  function setCaptain(id: string) {
    setSlots((prev) => prev.map((slot) => ({ ...slot, captain: slot.player.id === id })));
  }

  function applyAiPicks(picks: { playerId: string; starter: boolean; captain: boolean }[]) {
    const byId = new Map(players.map((player) => [player.id, player]));
    const next: SquadSlot[] = [];
    for (const pick of picks) {
      const player = byId.get(pick.playerId);
      if (player) next.push({ player, starter: pick.starter, captain: pick.captain });
    }
    setSlots(next);
    setResult(null);
    setError(null);
    setHydrated(true);
  }

  async function submit() {
    if (!address) return;
    setBusy(true);
    setError(null);
    const payload = {
      name: name.trim(),
      formation: formationFromStarters(slots),
      picks: slots.map((slot) => ({
        playerId: slot.player.id,
        starter: slot.starter,
        captain: slot.captain,
      })),
    };
    try {
      const res = teamId
        ? await updateTeam(teamId, payload)
        : await createTeam({ ownerAddress: address, ...payload });
      setTeamId(res.id);
      setResult({ id: res.id, cost: res.costMillions });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your team");
    } finally {
      setBusy(false);
    }
  }

  if (players.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <EmptyState
          icon={<UserGroupIcon size={16} />}
          label="PLAYER_POOL_OFFLINE"
          hint="The player pool could not be loaded. Start the Whistle backend, seed the players, then refresh."
        />
      </div>
    );
  }

  return (
    <>
      <ManagerCoach filled={slots.length} remaining={remaining} validation={validation} />
      <AiPickPanel players={players} onDraft={applyAiPicks} />
      {slots.some((slot) => slot.starter) ? <PitchView slots={slots} onSetCaptain={setCaptain} /> : null}
      <div className="mx-auto grid max-w-7xl items-start gap-6 px-6 md:grid-cols-[1.4fr_1fr] md:px-10">
      <PlayerPool
        players={players}
        selectedIds={selectedIds}
        counts={counts}
        remaining={remaining}
        onAdd={add}
        onRemove={remove}
      />
      <SquadBoard
        slots={slots}
        validation={validation}
        budget={DEFAULT_BUDGET}
        name={name}
        busy={busy}
        editing={Boolean(teamId)}
        isConnected={isConnected}
        result={result}
        error={error}
        onName={setName}
        onToggleStarter={toggleStarter}
        onSetCaptain={setCaptain}
        onRemove={remove}
        onAutoPick={() => setSlots((prev) => autoPickStarters(prev))}
        onClear={() => {
          setSlots([]);
          setResult(null);
          setError(null);
        }}
        onSubmit={submit}
      />
      </div>
    </>
  );
}
