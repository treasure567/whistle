"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  src: string | undefined;
  name: string;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PlayerAvatar({ src, name, size = 48, className }: PlayerAvatarProps) {
  const [errored, setErrored] = useState(false);
  const showImg = src && !errored;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ring-white/15",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showImg ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setErrored(true)}
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-mono text-[11px] font-semibold tracking-tight text-zinc-300">
          {initials(name)}
        </div>
      )}
    </div>
  );
}
