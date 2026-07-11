"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import type { UserProfile } from "@/types";

export function useUser() {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const sync = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      const res = await fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, refCode: ref }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setCompletedQuests(data.completedQuests ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!isConnected || !address) {
      setUser(null);
      setCompletedQuests([]);
      return;
    }
    sync();
  }, [isConnected, address, sync]);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      fetch(`/api/referral/track?ref=${encodeURIComponent(ref)}`);
    }
  }, []);

  const completeQuest = async (questId: string) => {
    if (!address) return false;
    const res = await fetch(`/api/quests/${questId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: address }),
    });
    const data = await res.json();
    if (data.success) {
      setCompletedQuests(data.completedQuests);
      if (data.score !== undefined && user) {
        setUser({ ...user, score: data.score });
      }
      await sync();
      return true;
    }
    return false;
  };

  return { user, completedQuests, loading, sync, completeQuest, address, isConnected };
}
