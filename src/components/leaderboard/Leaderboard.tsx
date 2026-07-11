"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import type { LeaderboardEntry } from "@/types";
import { TwitterConnect } from "@/components/connect/TwitterConnect";
import { GlitchText, TerminalFrame } from "@/components/effects/Terminal";
import { ReferralPanel } from "@/components/referral/ReferralPanel";
import { RankEventToast } from "@/components/leaderboard/RankEventToast";
import { useLiveLeaderboard } from "@/hooks/useLiveLeaderboard";
import { useUser } from "@/hooks/useUser";
import { DEMO_DISCLAIMER } from "@/lib/data/demo-leaderboard";

const FILTERS = ["24H", "7D", "30D", "ALL"] as const;

export function Leaderboard() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [glitchFlash, setGlitchFlash] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { user } = useUser();
  const { entries, events, total, dismissEvent } = useLiveLeaderboard();

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);
  const maxScore = entries[0]?.score ?? 1;

  const handleFilter = (f: (typeof FILTERS)[number]) => {
    setFilter(f);
    setGlitchFlash(true);
    setTimeout(() => setGlitchFlash(false), 350);
  };

  return (
    <section id="leaderboard" ref={sectionRef} className="relative overflow-hidden py-16 sm:py-24">
      <RankEventToast events={events} onDismiss={dismissEvent} />

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="data-stream absolute inset-y-0 left-[8%] w-px opacity-20" />
        <div className="data-stream absolute inset-y-0 right-[12%] w-px opacity-15 [animation-delay:1.5s]" />
      </div>

      {glitchFlash && <div className="leaderboard-flash pointer-events-none absolute inset-0 z-20" aria-hidden />}

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-6 border border-[#ffff00]/40 bg-[#ffff00]/5 px-4 py-3 font-mono text-[10px] leading-relaxed text-[#ffff00] sm:text-xs"
        >
          <span className="mr-2 font-bold">⚠ DEMO_MODE</span>
          {DEMO_DISCLAIMER}
        </motion.div>

        <div className="mb-10 text-center font-mono sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mb-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] sm:text-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff0080] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff0080]" />
            </span>
            <span className="text-[#ff0080]">live_sync // demo_feed</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            <GlitchText as="span" className="hero-glitch text-terminal">
              RANK_MATRIX
            </GlitchText>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="mt-5 inline-flex border border-terminal font-mono text-[10px] uppercase sm:text-xs"
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => handleFilter(f)}
                className={`relative px-4 py-2 transition ${
                  filter === f ? "bg-terminal text-black" : "text-dim hover:text-terminal"
                }`}
              >
                {f}
              </button>
            ))}
          </motion.div>
        </div>

        <Podium entries={topThree} maxScore={maxScore} inView={inView} />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_17rem] lg:gap-8">
          <TerminalFrame title={`rank_dump.db — ${filter} — DESC`} className="glitch-hover-frame">
            <div className="mb-3 hidden grid-cols-[2rem_1fr_4rem_5rem] gap-3 border-b border-terminal pb-2 font-mono text-[9px] uppercase tracking-wider text-dim sm:grid">
              <span>#</span>
              <span>Node</span>
              <span className="text-center">24H</span>
              <span className="text-right">Score</span>
            </div>

            <div className="space-y-1">
              <AnimatePresence mode="popLayout" initial={false}>
                {rest.map((entry, i) => (
                  <RankRow key={entry.handle} entry={entry} maxScore={maxScore} index={i} inView={inView} />
                ))}
              </AnimatePresence>
            </div>

            <p className="mt-4 border-t border-terminal/30 pt-3 text-center font-mono text-[10px] text-dim">
              showing 04–{String(entries.length).padStart(2, "0")} of {total} nodes · simulated
            </p>
          </TerminalFrame>

          <aside className="flex flex-col gap-4">
            <ReferralPanel user={user} />
            <YourSlotCard />
            <DeltaLeaders entries={entries} inView={inView} />
          </aside>
        </div>
      </div>
    </section>
  );
}

function Podium({
  entries,
  maxScore,
  inView,
}: {
  entries: LeaderboardEntry[];
  maxScore: number;
  inView: boolean;
}) {
  const order = [entries[1], entries[0], entries[2]];

  return (
    <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
      <AnimatePresence mode="popLayout">
        {order.map((entry, idx) => {
          if (!entry) return null;
          const isChamp = entry.rank === 1;
          const heights = ["h-[88%]", "h-full", "h-[82%]"];

          return (
            <motion.div
              key={entry.handle}
              layout
              layoutId={`podium-${entry.handle}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className={`relative flex flex-col ${heights[idx]} ${isChamp ? "z-10 sm:-mt-2" : ""}`}
            >
              {isChamp && (
                <>
                  <div className="champion-glow pointer-events-none absolute -inset-1 opacity-60" />
                  <div className="scan-line pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden opacity-30" />
                </>
              )}

              <div
                className={`relative flex flex-1 flex-col border bg-black/80 p-3 font-mono backdrop-blur-sm sm:p-4 ${
                  isChamp ? "border-terminal champion-border rank-pulse-up" : "border-terminal/40"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={`text-xs font-bold ${isChamp ? "text-[#ffff00]" : "text-dim"}`}>
                    #{String(entry.rank).padStart(2, "0")}
                  </span>
                  {isChamp && <span className="animate-pulse text-[9px] uppercase text-[#ff0080]">champ</span>}
                </div>

                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center border text-sm font-bold sm:h-12 sm:w-12 ${
                    isChamp ? "border-terminal bg-terminal text-black" : "border-terminal/50 text-terminal"
                  }`}
                >
                  {entry.avatar}
                </div>

                <p className="truncate text-xs font-bold text-terminal">{entry.displayName}</p>
                <p className="truncate text-[10px] text-dim">@{entry.handle}</p>

                {isChamp ? (
                  <GlitchText as="p" className="hero-glitch mt-3 text-xl font-bold text-[#00f0ff] sm:text-2xl">
                    {entry.score.toLocaleString()}
                  </GlitchText>
                ) : (
                  <motion.p
                    key={entry.score}
                    initial={{ scale: 1.08, color: "#ffff00" }}
                    animate={{ scale: 1, color: "#00f0ff" }}
                    transition={{ duration: 0.4 }}
                    className="mt-3 text-lg font-bold"
                  >
                    {entry.score.toLocaleString()}
                  </motion.p>
                )}

                <ScoreBar score={entry.score} max={maxScore} delay={0.4 + idx * 0.1} inView={inView} />

                {(entry.referrals ?? 0) > 0 && (
                  <p className="mt-1 text-[9px] text-[#ff0080]">{entry.referrals} refs</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function ScoreBar({
  score,
  max,
  delay,
  inView,
}: {
  score: number;
  max: number;
  delay: number;
  inView: boolean;
}) {
  const pct = score / max;

  return (
    <div className="mt-2 h-1 w-full overflow-hidden bg-terminal/10">
      <motion.div
        className="score-bar-fill h-full origin-left"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: pct } : { scaleX: 0 }}
        transition={{ delay, duration: 0.6, ease: "easeOut" }}
        layout
      />
    </div>
  );
}

function RankRow({
  entry,
  maxScore,
  index,
  inView,
}: {
  entry: LeaderboardEntry;
  maxScore: number;
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      layout
      layoutId={`row-${entry.handle}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="rank-row group grid grid-cols-[1fr_auto] items-center gap-3 border border-transparent px-2 py-2.5 sm:grid-cols-[2rem_1fr_4rem_5rem] sm:gap-3"
    >
      <motion.span
        layout
        className="hidden font-mono text-xs text-dim sm:block"
        key={`rank-${entry.rank}`}
      >
        {String(entry.rank).padStart(2, "0")}
      </motion.span>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-dim sm:hidden">#{entry.rank}</span>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-terminal/40 bg-black text-[10px] font-bold text-terminal">
            {entry.avatar}
          </div>
          <div className="min-w-0 truncate">
            <p className="truncate font-mono text-xs text-terminal">{entry.displayName}</p>
            <p className="truncate font-mono text-[10px] text-dim">@{entry.handle}</p>
          </div>
        </div>
        <div className="mt-1.5 h-0.5 w-full overflow-hidden bg-terminal/5 sm:max-w-[85%]">
          <motion.div
            className="score-bar-fill h-full origin-left opacity-60"
            animate={{ scaleX: entry.score / maxScore }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
            layout
          />
        </div>
      </div>

      <motion.span
        layout
        key={`delta-${entry.delta24h}`}
        className="hidden text-center font-mono text-[10px] text-[#00f0ff] sm:block"
      >
        +{entry.delta24h.toLocaleString()}
      </motion.span>

      <div className="text-right font-mono">
        <motion.p
          key={entry.score}
          initial={{ color: "#ffff00" }}
          animate={{ color: "#00ff41" }}
          transition={{ duration: 0.35 }}
          className="text-sm font-bold group-hover:text-[#00f0ff] transition-colors"
        >
          {entry.score.toLocaleString()}
        </motion.p>
      </div>
    </motion.div>
  );
}

function YourSlotCard() {
  return (
    <div className="terminal-frame">
      <div className="terminal-titlebar">
        <span className="terminal-dots">● ● ●</span>
        <span>your_slot.dat</span>
      </div>
      <div className="flex flex-col items-center gap-3 p-5 text-center font-mono">
        <div className="flex h-14 w-14 items-center justify-center border-2 border-dashed border-terminal/50 text-2xl text-dim animate-pulse">
          ?
        </div>
        <p className="text-xs text-terminal">{">"} BUFFER_EMPTY</p>
        <p className="text-[9px] text-dim">Real rank unlocks at TGE</p>
        <TwitterConnect />
      </div>
    </div>
  );
}

function DeltaLeaders({
  entries,
  inView,
}: {
  entries: LeaderboardEntry[];
  inView: boolean;
}) {
  const topDelta = [...entries].sort((a, b) => b.delta24h - a.delta24h).slice(0, 3);

  return (
    <div className="border border-terminal/50 bg-black/60 p-4 font-mono">
      <p className="mb-3 text-[10px] uppercase tracking-wider text-[#ff0080]">▲ top_24h_delta</p>
      <ul className="space-y-2">
        <AnimatePresence mode="popLayout">
          {topDelta.map((e, i) => (
            <motion.li
              key={e.handle}
              layout
              initial={{ opacity: 0, x: 8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="flex items-center justify-between text-[10px] sm:text-xs"
            >
              <span className="truncate text-dim">@{e.handle}</span>
              <span className="font-bold text-[#00f0ff]">+{e.delta24h.toLocaleString()}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
