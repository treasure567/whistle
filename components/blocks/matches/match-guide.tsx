"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight01Icon, Calendar01Icon, Location01Icon, Loading03Icon, SparklesIcon } from "hugeicons-react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button } from "@/components/ui/button";
import { FlagOrb } from "@/components/ui/flag-orb";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { StadiumPitch } from "@/components/ui/stadium-pitch";
import { fetchMatchRead, sendMatchChat, type ChatMessage } from "@/lib/api/match-read";
import type { MatchReadResult, PlayerRecord } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";

const OUTCOME_COLOR = ["bg-violet-500", "bg-zinc-500", "bg-emerald-500"];
const dateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export type GuideMatch = {
  id: string;
  home: string;
  away: string;
  homeCode: string;
  awayCode: string;
  venue: string | null;
  city: string | null;
  kickoffAt: number;
};

export function MatchGuide({
  match,
  homePlayers,
  awayPlayers,
  homeXI,
  awayXI,
}: {
  match: GuideMatch;
  homePlayers: PlayerRecord[];
  awayPlayers: PlayerRecord[];
  homeXI: PlayerRecord[];
  awayXI: PlayerRecord[];
}) {
  const { home, away, homeCode, awayCode } = match;
  const [read, setRead] = useState<MatchReadResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetchMatchRead(home, away)
      .then((r) => {
        if (!active) return;
        setRead(r);
        setSuggestions(r.suggestions);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [home, away]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || sending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const r = await sendMatchChat(home, away, next);
      setMessages((m) => [...m, { role: "assistant", content: r.reply }]);
      if (r.suggestions.length > 0) setSuggestions(r.suggestions);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "My line dropped for a second. Ask me again." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <section className="relative h-[320px] overflow-hidden border-b border-border md:h-[440px]">
        <StadiumPitch homeXI={homeXI} awayXI={awayXI} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/10" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          {match.venue ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur">
              <Location01Icon size={12} /> {match.venue}
              {match.city ? ` · ${match.city}` : ""}
            </span>
          ) : null}
          <div className="flex items-center gap-4 sm:gap-7">
            <Team code={homeCode} name={home} />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">v</span>
            <Team code={awayCode} name={away} />
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-violet-300">
            <Calendar01Icon size={12} /> {dateFmt.format(match.kickoffAt)}
          </span>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <KeyPlayers code={homeCode} name={home} players={homePlayers} />
          <KeyPlayers code={awayCode} name={away} players={awayPlayers} />
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <AgentAvatar agent="bookie" size={40} ring />
              <div>
                <p className="text-sm font-semibold text-foreground">Jack&apos;s read</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-200/80">
                  Your bookie breaks it down
                </p>
              </div>
              {read ? (
                <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">
                  <SparklesIcon size={11} />
                  {read.source === "llm" ? "Live AI" : "Model"}
                </span>
              ) : null}
            </div>

            {loading ? (
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-5 text-[13px] text-muted-foreground">
                <Loading03Icon size={15} className="animate-spin text-amber-300" />
                Jack is reading the match...
              </div>
            ) : read ? (
              <>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="space-y-2">
                    {read.outcomes.map((o, i) => (
                      <div key={o.label} className="flex items-center gap-3">
                        <span className="w-20 shrink-0 text-[12px] text-foreground">{o.label}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/[0.08]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${o.pct}%` }}
                            transition={{ type: "spring", stiffness: 200, damping: 30 }}
                            className={cn("h-full rounded-full", OUTCOME_COLOR[i] ?? "bg-violet-500")}
                          />
                        </div>
                        <span className="w-9 shrink-0 text-right font-mono text-[12px] tabular-nums text-foreground">
                          {o.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[13px] font-serif-italic leading-relaxed text-muted-foreground">“{read.summary}”</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {read.markets.map((m) => (
                    <div key={m.label} className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] text-foreground">{m.label}</span>
                        <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/[0.08] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-200">
                          {m.lean}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{m.note}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="rounded-2xl border border-border bg-card p-5 text-[13px] text-muted-foreground">
                Jack couldn&apos;t read this one. Try again shortly.
              </p>
            )}
          </div>

          <div className="flex h-[520px] flex-col rounded-2xl border border-border bg-card">
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              <div className="flex gap-2">
                <AgentAvatar agent="bookie" size={26} className="mt-0.5" />
                <div className="max-w-[85%] rounded-2xl border border-border bg-foreground/[0.03] px-3.5 py-2 text-[13px] leading-relaxed text-foreground">
                  Ask me anything about {home} v {away}.
                </div>
              </div>
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                  {m.role === "assistant" ? <AgentAvatar agent="bookie" size={26} className="mt-0.5" /> : null}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
                      m.role === "user" ? "bg-violet-500 text-white" : "border border-border bg-foreground/[0.03] text-foreground",
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {sending ? (
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <AgentAvatar agent="bookie" size={26} />
                  <Loading03Icon size={13} className="animate-spin" /> Jack is thinking...
                </div>
              ) : null}
            </div>

            <div className="border-t border-border p-3">
              {suggestions.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {suggestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void send(q)}
                      disabled={sending}
                      className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-violet-400/40 hover:text-foreground disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              ) : null}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Jack about this match"
                  aria-label="Ask Jack"
                  className="h-10 flex-1 rounded-full border border-border bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-violet-400/50"
                />
                <button
                  type="submit"
                  disabled={sending || input.trim().length === 0}
                  aria-label="Send"
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <ArrowRight01Icon size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Like Jack&apos;s read? Back a call on this match. Staked calls fund Jack onchain.
          </p>
          <Link href={`/play/predict?match=${match.id}`}>
            <Button variant="violet" size="sm">
              Make a prediction
              <ArrowRight01Icon size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Team({ code, name }: { code: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <FlagOrb code={code} size={56} />
      <span className="max-w-[7rem] text-balance text-sm font-semibold leading-tight text-foreground">{name}</span>
    </div>
  );
}

function KeyPlayers({ code, name, players }: { code: string; name: string; players: PlayerRecord[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <FlagOrb code={code} size={22} />
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Key players
        </span>
      </div>
      {players.length === 0 ? (
        <p className="py-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Squad not in yet
        </p>
      ) : (
        <div className="space-y-1.5">
          {players.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-foreground/[0.02] px-3 py-2">
              <PlayerAvatar src={p.photo ?? undefined} name={p.name} size={30} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-foreground">{p.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{p.position}</p>
              </div>
              <span className="font-mono text-[12px] tabular-nums text-violet-300">{p.priceMillions.toFixed(1)}m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
