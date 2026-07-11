"use client";

import clsx from "clsx";
import type { LeaderboardEntry } from "@/types";

type LiveFeedTickerProps = {
  entries: LeaderboardEntry[];
  pinned?: boolean;
};

export function LiveFeedTicker({ entries, pinned = false }: LiveFeedTickerProps) {
  const items = [...entries, ...entries, ...entries];

  return (
    <div
      className={clsx(
        "relative shrink-0 overflow-hidden border-t border-terminal bg-black py-2.5",
        pinned && "z-10",
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent" />

      <div className="flex animate-marquee gap-10 whitespace-nowrap font-mono text-xs">
        {items.map((entry, i) => (
          <span key={`${entry.handle}-${i}`} className="inline-flex items-center gap-2">
            <span className="text-[#ff0080]">[SYNC]</span>
            <span className="font-bold text-terminal">
              +{entry.score.toLocaleString()}
            </span>
            <span className="text-dim">@{entry.handle}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
