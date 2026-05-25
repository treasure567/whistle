"use client";

import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/api/config";
import {
  agentActivityEventSchema,
  eventToActivityItem,
} from "@/lib/api/feed";
import type { ActivityItem } from "@/types";

const MAX_LIVE_ITEMS = 50;

export function useLiveFeed(): ActivityItem[] {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") return;

    const source = new EventSource(`${API_BASE_URL}/feed`);
    const onAgent = (event: MessageEvent<string>) => {
      const parsed = agentActivityEventSchema.safeParse(safeJson(event.data));
      if (!parsed.success) return;
      setItems((current) => [eventToActivityItem(parsed.data), ...current].slice(0, MAX_LIVE_ITEMS));
    };

    source.addEventListener("whistle.agent", onAgent as EventListener);
    return () => {
      source.removeEventListener("whistle.agent", onAgent as EventListener);
      source.close();
    };
  }, []);

  return items;
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
