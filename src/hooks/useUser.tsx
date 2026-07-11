"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAccount } from "wagmi";
import type { TwitterSession } from "@/types";
import type { UserProfile } from "@/types";

type UserContextValue = {
  user: UserProfile | null;
  completedQuests: string[];
  loading: boolean;
  twitterConnected: boolean;
  walletConnected: boolean;
  isLinked: boolean;
  sync: () => Promise<void>;
  completeQuest: (questId: string) => Promise<boolean>;
  address: string | undefined;
  isConnected: boolean;
  refreshTwitterSession: () => Promise<TwitterSession>;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [twitterSession, setTwitterSession] = useState<TwitterSession>({ connected: false });

  const refreshTwitterSession = useCallback(async () => {
    const res = await fetch("/api/auth/session");
    const data = (await res.json()) as TwitterSession;
    setTwitterSession(data);
    return data;
  }, []);

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
      if (data.error) {
        console.error("[sync]", data.error);
        if (res.status === 409) {
          window.dispatchEvent(new CustomEvent("ipg:link-conflict", { detail: data.error }));
        }
        return;
      }
      if (data.user) {
        setUser(data.user);
        setCompletedQuests(data.completedQuests ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refreshTwitterSession();
  }, [refreshTwitterSession]);

  useEffect(() => {
    if (!isConnected || !address) {
      setUser(null);
      setCompletedQuests([]);
      return;
    }
    sync();
  }, [isConnected, address, sync]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const twitterStatus = params.get("twitter");

    if (twitterStatus === "connected" && address) {
      refreshTwitterSession().then(() => sync());
      params.delete("twitter");
      params.delete("detail");
      params.delete("linked");
      const qs = params.toString();
      window.history.replaceState({}, "", qs ? `?${qs}` : window.location.pathname);
    }
  }, [address, sync, refreshTwitterSession]);

  useEffect(() => {
    const onFocus = () => {
      refreshTwitterSession();
      if (address) sync();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [address, sync, refreshTwitterSession]);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) fetch(`/api/referral/track?ref=${encodeURIComponent(ref)}`);
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

  const isLinked = Boolean(
    user?.wallet && user?.username && twitterSession.connected,
  );

  return (
    <UserContext.Provider
      value={{
        user,
        completedQuests,
        loading,
        twitterConnected: twitterSession.connected,
        walletConnected: isConnected,
        isLinked,
        sync,
        completeQuest,
        address,
        isConnected,
        refreshTwitterSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
}
