import Image from "next/image";

import { cn } from "@/lib/utils";
import type { AgentSlug } from "@/types";

const AGENT_MEMOJI: Record<AgentSlug, string> = {
  scout: "/agents/emma-memoji.png",
  bookie: "/agents/jack-memoji.png",
  manager: "/agents/tom-memoji.png",
};

const AGENT_NAMES: Record<AgentSlug, string> = {
  scout: "Emma",
  bookie: "Jack",
  manager: "Tom",
};

interface AgentAvatarProps {
  agent: AgentSlug;
  size?: number;
  className?: string;
  ring?: boolean;
}

export function AgentAvatar({ agent, size = 36, className, ring = false }: AgentAvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full border bg-[#0F0F12]",
        ring ? "border-white/20" : "border-white/10",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={AGENT_MEMOJI[agent]}
        alt={AGENT_NAMES[agent]}
        width={size}
        height={size}
        className="size-full scale-[1.12] object-cover object-[center_15%]"
      />
    </span>
  );
}
