"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LeaderboardEntry } from "@/types";
import {
  DEMO_LEADERBOARD,
  DEMO_RANK_ACTIONS,
  type DemoRankAction,
} from "@/lib/data/demo-leaderboard";

export type RankEvent = {
  id: string;
  handle: string;
  displayName: string;
  avatar: string;
  action: DemoRankAction;
  oldRank: number;
  newRank: number;
  scoreDelta: number;
};

function cloneEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries.map((e) => ({ ...e }));
}

function resort(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  return sorted.map((e, i) => ({ ...e, rank: i + 1 }));
}

function pickUpAction(): DemoRankAction {
  const ups = DEMO_RANK_ACTIONS.filter((a) => a.tone === "up");
  return ups[Math.floor(Math.random() * ups.length)]!;
}

const OVERTAKEN: DemoRankAction = DEMO_RANK_ACTIONS.find(
  (a) => a.label === "Overtaken by rival node",
)!;

function applyActionMeta(entry: LeaderboardEntry, action: DemoRankAction) {
  if (action.label.includes("friend")) entry.referrals = (entry.referrals ?? 0) + 1;
  if (action.label.includes("thread") || action.label.includes("score card")) entry.posts += 1;
  if (action.label.includes("Followed")) entry.supporters += 1;
}

function simulateTick(entries: LeaderboardEntry[]): {
  entries: LeaderboardEntry[];
  events: RankEvent[];
} {
  if (entries.length === 0) return { entries, events: [] };

  const copy = cloneEntries(entries);
  const oldRanks = new Map(copy.map((e) => [e.handle, e.rank]));

  const actor = copy[Math.floor(Math.random() * copy.length)]!;
  const action = pickUpAction();
  const scoreDelta = action.xp;

  actor.score += scoreDelta;
  actor.delta24h += scoreDelta;
  applyActionMeta(actor, action);

  const resorted = resort(copy);
  const events: RankEvent[] = [];
  const ts = Date.now();

  const actorNew = resorted.find((e) => e.handle === actor.handle)!;
  events.push({
    id: `${ts}-act-${actor.handle}`,
    handle: actor.handle,
    displayName: actor.displayName,
    avatar: actor.avatar,
    action,
    oldRank: oldRanks.get(actor.handle)!,
    newRank: actorNew.rank,
    scoreDelta,
  });

  for (const e of resorted) {
    const old = oldRanks.get(e.handle)!;
    if (e.rank > old && e.handle !== actor.handle) {
      events.push({
        id: `${ts}-drop-${e.handle}`,
        handle: e.handle,
        displayName: e.displayName,
        avatar: e.avatar,
        action: OVERTAKEN,
        oldRank: old,
        newRank: e.rank,
        scoreDelta: 0,
      });
    }
  }

  return { entries: resorted, events: events.slice(0, 2) };
}

export function useLiveLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [events, setEvents] = useState<RankEvent[]>([]);
  const [total, setTotal] = useState(271);
  const [loaded, setLoaded] = useState(false);
  const entriesRef = useRef<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        const initial = cloneEntries(DEMO_LEADERBOARD);
        entriesRef.current = initial;
        setEntries(initial);
        setTotal(d.total ?? 271);
        setLoaded(true);
      })
      .catch(() => {
        entriesRef.current = cloneEntries(DEMO_LEADERBOARD);
        setEntries(DEMO_LEADERBOARD);
        setLoaded(true);
      });
  }, []);

  const dismissEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const tick = () => {
      const { entries: next, events: newEvents } = simulateTick(entriesRef.current);
      entriesRef.current = next;
      setEntries(next);
      if (newEvents.length) {
        setEvents((prev) => [...newEvents, ...prev].slice(0, 6));
      }
    };

    const id = setInterval(tick, 5000 + Math.random() * 3500);
    return () => clearInterval(id);
  }, [loaded]);

  useEffect(() => {
    if (events.length === 0) return;
    const timers = events.map((e) =>
      setTimeout(() => dismissEvent(e.id), 5000),
    );
    return () => timers.forEach(clearTimeout);
  }, [events, dismissEvent]);

  return { entries, events, total, dismissEvent };
}
