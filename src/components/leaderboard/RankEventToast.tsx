"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { RankEvent } from "@/hooks/useLiveLeaderboard";

type RankEventToastProps = {
  events: RankEvent[];
  onDismiss: (id: string) => void;
};

export function RankEventToast({ events, onDismiss }: RankEventToastProps) {
  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-[60] flex w-[min(100vw-2rem,22rem)] flex-col gap-2 sm:bottom-8">
      <AnimatePresence mode="popLayout">
        {events.map((event) => {
          const movedUp = event.newRank < event.oldRank;
          const movedDown = event.newRank > event.oldRank;
          const rankDelta = Math.abs(event.oldRank - event.newRank);

          return (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="pointer-events-auto border border-terminal/50 bg-black/95 p-3 font-mono shadow-[0_0_24px_rgba(0,255,65,0.12)] backdrop-blur-md"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-terminal/40 bg-black text-xs font-bold text-terminal">
                    {event.avatar}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold text-terminal">
                      @{event.handle}
                    </p>
                    {rankDelta > 0 && (
                      <p
                        className="text-[10px] font-bold"
                        style={{ color: movedUp ? "#00ff41" : "#ff0080" }}
                      >
                        {movedUp ? "▲" : "▼"} {rankDelta} rank{rankDelta > 1 ? "s" : ""}{" "}
                        <span className="text-dim">
                          #{String(event.oldRank).padStart(2, "0")} → #
                          {String(event.newRank).padStart(2, "0")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(event.id)}
                  className="shrink-0 text-[10px] text-dim hover:text-[#ff0080]"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>

              <p className="text-[10px] leading-relaxed text-dim">
                <span style={{ color: event.action.color }}>{">"}</span>{" "}
                <span className="text-foreground">{event.action.label}</span>
                {event.scoreDelta !== 0 && (
                  <span
                    className="ml-1 font-bold"
                    style={{ color: event.scoreDelta > 0 ? "#00f0ff" : "#ff0080" }}
                  >
                    {event.scoreDelta > 0 ? "+" : ""}
                    {event.scoreDelta.toLocaleString()} XP
                  </span>
                )}
              </p>

              {!movedUp && !movedDown && event.scoreDelta > 0 && (
                <p className="mt-1 text-[9px] text-dim">rank_hold // score_injected</p>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
