"use client";

import { useState } from "react";
import Image from "next/image";

import { flagOf, flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface FlagOrbProps {
  code: string;
  size?: number;
  className?: string;
}

export function FlagOrb({ code, size = 48, className }: FlagOrbProps) {
  const [errored, setErrored] = useState(false);
  const src = flagUrl(code, 160);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-card ring-1 ring-border",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src && !errored ? (
        <Image
          src={src}
          alt={`${code} flag`}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setErrored(true)}
          unoptimized
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ fontSize: size * 0.55 }}
          aria-hidden
        >
          {flagOf(code)}
        </div>
      )}
    </div>
  );
}
