"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { fetchTeam } from "@/lib/api/fantasy";
import type { FantasyTeamRecord } from "@/lib/api/schemas";

export function useMyTeam() {
  const { address } = useAccount();
  const [team, setTeam] = useState<FantasyTeamRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!address) {
        if (active) setTeam(null);
        return;
      }
      if (active) setLoading(true);
      const result = await fetchTeam(address);
      if (active) {
        setTeam(result);
        setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [address]);

  return { team, loading, address };
}
