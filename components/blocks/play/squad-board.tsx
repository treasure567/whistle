"use client";

import { motion } from "motion/react";
import {
  CheckmarkCircle02Icon,
  CrownIcon,
  Delete02Icon,
  Loading03Icon,
  StarIcon,
} from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/ui/connect-button";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import {
  POSITIONS,
  POSITION_LABEL,
  STARTING_SIZE,
  countByPosition,
  type Position,
  type SquadSlot,
  type SquadValidation,
} from "@/lib/fantasy";
import { cn } from "@/lib/utils";

interface SquadBoardProps {
  slots: SquadSlot[];
  validation: SquadValidation;
  budget: number;
  name: string;
  busy: boolean;
  editing: boolean;
  isConnected: boolean;
  result: { id: string; cost: number } | null;
  error: string | null;
  onName: (value: string) => void;
  onToggleStarter: (id: string) => void;
  onSetCaptain: (id: string) => void;
  onRemove: (id: string) => void;
  onAutoPick: () => void;
  onClear: () => void;
  onSubmit: () => void;
}

export function SquadBoard(props: SquadBoardProps) {
  const { slots, validation, budget, name, busy, editing, isConnected, result, error } = props;
  const counts = countByPosition(slots);
  const starters = slots.filter((slot) => slot.starter).length;
  const pct = Math.min(100, (validation.cost / budget) * 100);
  const over = validation.cost > budget;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0B0B0E] p-5">
      <div>
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Squad value
          </span>
          <span className={cn("font-mono text-sm tabular-nums", over ? "text-red-300" : "text-zinc-100")}>
            {validation.cost.toFixed(1)}m / {budget.toFixed(0)}m
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className={cn("h-full rounded-full", over ? "bg-red-500" : "bg-violet-500")}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {POSITIONS.map((position) => (
            <span
              key={position}
              className="rounded-sm border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400"
            >
              {position} {counts[position]}
            </span>
          ))}
          <span className="rounded-sm border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
            XI {starters}/{STARTING_SIZE}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={props.onAutoPick} disabled={slots.length === 0}>
          <StarIcon size={14} />
          Auto-pick XI
        </Button>
        <Button variant="ghost" size="sm" onClick={props.onClear} disabled={slots.length === 0}>
          Clear
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {POSITIONS.map((position) => (
          <PositionGroup
            key={position}
            position={position}
            slots={slots.filter((slot) => slot.player.position === position)}
            startersFull={starters >= STARTING_SIZE}
            onToggleStarter={props.onToggleStarter}
            onSetCaptain={props.onSetCaptain}
            onRemove={props.onRemove}
          />
        ))}
      </div>

      {result ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
          <CheckmarkCircle02Icon size={18} className="text-emerald-300" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">
              {editing ? "Team updated" : "Team saved"}
            </p>
            <p className="mt-0.5 text-sm text-emerald-100">
              {validation.cost.toFixed(1)}m of {budget.toFixed(0)}m used. You can join a league next.
            </p>
          </div>
        </div>
      ) : (
        <>
          {!validation.valid && slots.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {validation.errors.map((message) => (
                <li
                  key={message}
                  className="rounded-sm border border-amber-500/20 bg-amber-500/[0.05] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-200"
                >
                  {message}
                </li>
              ))}
            </ul>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-[12px] text-red-200">
              {error}
            </p>
          ) : null}

          <input
            value={name}
            onChange={(event) => props.onName(event.target.value)}
            placeholder="Name your team"
            aria-label="Team name"
            maxLength={60}
            className="h-11 w-full rounded-xl border border-white/10 bg-[#111113] px-4 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus-visible:border-violet-400/50"
          />

          {isConnected ? (
            <Button
              variant="violet"
              size="lg"
              onClick={props.onSubmit}
              disabled={!validation.valid || name.trim().length === 0 || busy}
            >
              {busy ? <Loading03Icon size={14} className="animate-spin" /> : null}
              {busy ? "Saving" : editing ? "Save changes" : "Save team"}
            </Button>
          ) : (
            <ConnectButton />
          )}
        </>
      )}
    </div>
  );
}

function PositionGroup({
  position,
  slots,
  startersFull,
  onToggleStarter,
  onSetCaptain,
  onRemove,
}: {
  position: Position;
  slots: SquadSlot[];
  startersFull: boolean;
  onToggleStarter: (id: string) => void;
  onSetCaptain: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  if (slots.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        {POSITION_LABEL[position]}
      </p>
      <div className="divide-y divide-white/[0.04] rounded-xl border border-white/10 bg-[#111113]">
        {slots.map((slot) => (
          <SlotRow
            key={slot.player.id}
            slot={slot}
            starterLocked={startersFull && !slot.starter}
            onToggleStarter={() => onToggleStarter(slot.player.id)}
            onSetCaptain={() => onSetCaptain(slot.player.id)}
            onRemove={() => onRemove(slot.player.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SlotRow({
  slot,
  starterLocked,
  onToggleStarter,
  onSetCaptain,
  onRemove,
}: {
  slot: SquadSlot;
  starterLocked: boolean;
  onToggleStarter: () => void;
  onSetCaptain: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <PlayerAvatar src={slot.player.photo ?? undefined} name={slot.player.name} size={26} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-zinc-100">{slot.player.name}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {slot.player.teamCode} · {slot.player.priceMillions.toFixed(1)}m
        </p>
      </div>
      <IconToggle
        active={slot.starter}
        disabled={starterLocked}
        onClick={onToggleStarter}
        label={slot.starter ? "Move to bench" : "Move to starting XI"}
        activeClass="border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-300"
      >
        <StarIcon size={13} />
      </IconToggle>
      <IconToggle
        active={slot.captain}
        onClick={onSetCaptain}
        label="Make captain"
        activeClass="border-violet-400/50 bg-violet-500/[0.10] text-violet-200"
      >
        <CrownIcon size={13} />
      </IconToggle>
      <IconToggle onClick={onRemove} label="Remove player" hoverClass="hover:border-red-500/40 hover:text-red-300">
        <Delete02Icon size={13} />
      </IconToggle>
    </div>
  );
}

function IconToggle({
  active = false,
  disabled = false,
  onClick,
  label,
  activeClass,
  hoverClass = "hover:border-white/25 hover:text-zinc-100",
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  activeClass?: string;
  hoverClass?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-30",
        active ? activeClass : cn("border-white/10 text-zinc-500", hoverClass),
      )}
    >
      {children}
    </button>
  );
}
