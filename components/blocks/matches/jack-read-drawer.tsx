"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight01Icon,
  Cancel01Icon,
  Loading03Icon,
  SparklesIcon,
} from "hugeicons-react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button } from "@/components/ui/button";
import { fetchMatchRead, sendMatchChat, type ChatMessage } from "@/lib/api/match-read";
import type { MatchReadResult } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";

const QUICK_QUESTIONS = ["Who's your pick?", "Will both teams score?", "Where's the value?"];
const OUTCOME_COLOR = ["bg-violet-500", "bg-zinc-500", "bg-emerald-500"];

export type JackMatch = { home: string; away: string };

export function JackReadDrawer({ match, onClose }: { match: JackMatch | null; onClose: () => void }) {
  return (
    <Dialog.Root open={match !== null} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <AnimatePresence>
        {match ? (
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
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 36 }}
                className="fixed right-0 top-0 z-50 flex h-full w-[min(460px,94vw)] flex-col border-l border-border bg-background"
              >
                <JackBody key={`${match.home}-${match.away}`} home={match.home} away={match.away} onClose={onClose} />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function JackBody({ home, away, onClose }: { home: string; away: string; onClose: () => void }) {
  const [read, setRead] = useState<MatchReadResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetchMatchRead(home, away)
      .then((r) => {
        if (active) setRead(r);
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
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "My line dropped for a second. Ask me again." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <AgentAvatar agent="bookie" size={40} ring />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Jack the Bookie</p>
          <Dialog.Title className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-amber-200/80">
            {home} v {away}
          </Dialog.Title>
        </div>
        <Dialog.Close asChild>
          <button
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          >
            <Cancel01Icon size={14} />
          </button>
        </Dialog.Close>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {loading ? (
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Loading03Icon size={15} className="animate-spin text-amber-300" />
            Jack is reading the match...
          </div>
        ) : read ? (
          <>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Jack&apos;s read
                </p>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">
                  <SparklesIcon size={11} />
                  {read.source === "llm" ? "Live AI" : "Model"}
                </span>
              </div>
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
              <p className="mt-3 text-[13px] italic leading-relaxed text-muted-foreground">“{read.summary}”</p>
            </div>

            <div className="space-y-2">
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
          <p className="text-[13px] text-muted-foreground">Jack couldn&apos;t read this one. Try again shortly.</p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "assistant" ? <AgentAvatar agent="bookie" size={26} className="mt-0.5" /> : null}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
                m.role === "user"
                  ? "bg-violet-500 text-white"
                  : "border border-border bg-card text-foreground",
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

      <div className="border-t border-border p-4">
        {messages.length === 0 ? (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void send(q)}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-violet-400/40 hover:text-foreground"
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
            className="h-10 flex-1 rounded-full border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-violet-400/50"
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
        <Link href="/play/predict" onClick={onClose} className="mt-3 block">
          <Button variant="outline" size="sm" className="w-full">
            Back a call on this match
            <ArrowRight01Icon size={13} />
          </Button>
        </Link>
      </div>
    </>
  );
}
