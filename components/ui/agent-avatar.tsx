import type { ReactElement } from "react";

import { cn } from "@/lib/utils";
import type { AgentSlug } from "@/types";

const SIGILS: Record<AgentSlug, ReactElement> = {
  scout: (
    <g>
      <circle cx="14" cy="14" r="2.5" fill="currentColor" />
      <circle cx="14" cy="14" r="6" stroke="currentColor" strokeWidth="0.75" opacity="0.55" fill="none" />
      <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="0.6" opacity="0.3" fill="none" />
      <line x1="14" y1="2" x2="14" y2="6" stroke="currentColor" strokeWidth="0.8" />
      <line x1="14" y1="22" x2="14" y2="26" stroke="currentColor" strokeWidth="0.8" />
    </g>
  ),
  bookie: (
    <g>
      <rect x="6" y="9" width="16" height="10" rx="1" stroke="currentColor" strokeWidth="0.9" fill="none" />
      <line x1="14" y1="9" x2="14" y2="19" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <line x1="6" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <text x="14" y="16.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="5" fontWeight="700" fill="currentColor">$</text>
    </g>
  ),
  manager: (
    <g>
      <path d="M4 22 L24 22" stroke="currentColor" strokeWidth="0.9" opacity="0.5" />
      <circle cx="9" cy="14" r="2" fill="currentColor" />
      <circle cx="14" cy="10" r="2" fill="currentColor" />
      <circle cx="19" cy="14" r="2" fill="currentColor" />
      <circle cx="11.5" cy="18" r="1.6" fill="currentColor" />
      <circle cx="16.5" cy="18" r="1.6" fill="currentColor" />
    </g>
  ),
};

interface AgentAvatarProps {
  agent: AgentSlug;
  size?: number;
  className?: string;
  ring?: boolean;
}

const AGENT_CLASS: Record<AgentSlug, string> = {
  scout: "agent-scout",
  bookie: "agent-bookie",
  manager: "agent-manager",
};

export function AgentAvatar({ agent, size = 36, className, ring = true }: AgentAvatarProps) {
  return (
    <span
      className={cn(
        AGENT_CLASS[agent],
        "relative inline-flex items-center justify-center rounded-full border bg-[#0F0F12]",
        ring && "agent-tint-border",
        !ring && "border-white/10",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 28 28"
        className="agent-tint-text"
        width={size * 0.78}
        height={size * 0.78}
      >
        {SIGILS[agent]}
      </svg>
      {ring ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[-3px] rounded-full opacity-40 agent-tint-glow"
        />
      ) : null}
    </span>
  );
}
