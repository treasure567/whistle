"use client";

import { useState } from "react";
import Image from "next/image";
import { UserIcon } from "hugeicons-react";

import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  src: string | undefined;
  name: string;
  size?: number;
  className?: string;
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
        <div
          className="flex h-full w-full items-center justify-center text-zinc-500"
          role="img"
          aria-label={name}
        >
          <UserIcon size={Math.round(size * 0.5)} />
        </div>
      )}
    </div>
  );
}
