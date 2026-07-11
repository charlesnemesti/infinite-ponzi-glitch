"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  SEASON_STATS,
} from "@/lib/data/mock-leaderboard";
import type { LeaderboardEntry } from "@/types";
import { GlitchText } from "@/components/effects/Terminal";
import { BootSequence } from "@/components/effects/BootSequence";
import { LiveFeedTicker } from "@/components/leaderboard/LiveFeedTicker";

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(count, value, { duration: 2.2, ease: "easeOut" });
    return controls.stop;
  }, [count, value]);

  return <motion.span className="text-terminal">{rounded}</motion.span>;
}

export function HeroSection() {
  const [bootDone, setBootDone] = useState(false);
  const [tickerEntries, setTickerEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => setTickerEntries(d.entries ?? []));
  }, []);

  return (
    <section
      id="hero"
      className="relative flex h-[100dvh] flex-col overflow-hidden pt-14 sm:pt-16"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00ff41]/6 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[40vmin] w-[40vmin] bg-[#ff0080]/4 blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      {/* Boot — esquina inferior izquierda, no compite con el centro */}
      <div
        className={`absolute bottom-12 left-4 z-10 w-[min(100%,18rem)] transition-opacity duration-700 sm:left-6 sm:w-72 ${
          bootDone ? "opacity-40 hover:opacity-100" : "opacity-100"
        }`}
      >
        <BootSequence compact onComplete={() => setBootDone(true)} />
      </div>

      {/* Contenido principal — centrado */}
      <div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 pb-2 pt-2 sm:px-6">
        {/* Badge superior */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:mb-6"
        >
          <span className="inline-flex items-center gap-2 border border-terminal bg-black/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-terminal backdrop-blur-sm sm:text-xs">
            <span className="animate-pulse text-[#ff0080]">●</span>
            PHASE_1 :: AIRDROP_INJECT
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-dim">
            chain_4663 · mainnet
          </span>
        </motion.div>

        {/* Top 3 flanking — solo desktop */}
        <div className="mb-2 hidden w-full max-w-4xl items-center justify-between font-mono text-[10px] xl:flex">
          <RankPeek rank={tickerEntries[1]} position="left" />
          <span className="text-dim uppercase tracking-[0.3em]">live_rank_feed</span>
          <RankPeek rank={tickerEntries[2]} position="right" />
        </div>

        {/* Título — protagonista */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center font-mono text-[clamp(2.25rem,8vw,5.5rem)] font-bold leading-[0.92] tracking-tight"
        >
          <span className="block text-dim text-[0.35em] tracking-[0.4em] sm:text-[0.3em]">
            ATTENTION_FI //
          </span>
          <GlitchText as="span" className="hero-glitch text-terminal">
            INFINITE
          </GlitchText>
          <br />
          <GlitchText as="span" className="hero-glitch text-[#ff0080]">
            PONZI
          </GlitchText>
          <span className="text-dim">_</span>
          <GlitchText as="span" className="hero-glitch text-[#00f0ff]">
            GLITCH
          </GlitchText>
        </motion.h1>

        {/* Champion #1 from live API */}
        {tickerEntries[0] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 flex items-center gap-3 border border-terminal/40 bg-black/50 px-4 py-2 font-mono backdrop-blur-sm sm:mt-5"
          >
            <span className="text-[#ffff00]">#1</span>
            <span className="text-terminal">@{tickerEntries[0].handle}</span>
            <span className="text-dim">·</span>
            <span className="font-bold text-[#00f0ff]">
              {tickerEntries[0].score.toLocaleString()}
            </span>
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-5 flex flex-wrap justify-center gap-2 sm:mt-7 sm:gap-3"
        >
          <a href="#quests" className="btn-terminal text-[10px] sm:text-xs">
            {">"} INJECT_QUESTS
          </a>
          <a href="#leaderboard" className="btn-terminal-ghost text-[10px] sm:text-xs">
            {">"} RANK_MATRIX
          </a>
        </motion.div>

        {/* Métricas HoodTracker-style — banda completa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-6 w-full max-w-3xl sm:mt-8"
        >
          <div className="grid grid-cols-3 gap-px border border-terminal bg-terminal/20">
            <MetricCell label="REWARD_SUPPLY" value={`${SEASON_STATS.rewardSupplyPercent}%`} />
            <MetricCell
              label="TTL_DAYS"
              value={String(SEASON_STATS.daysLeft)}
              accent
            />
            <MetricCell label="NODES" value={String(SEASON_STATS.totalPosters)} />
          </div>

          <div className="border border-t-0 border-terminal bg-black/70 px-4 py-5 text-center backdrop-blur-sm sm:py-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim sm:text-xs">
              will_you_survive_the_glitch?
            </p>
            <p className="mt-2 font-mono text-[clamp(2.5rem,10vw,4rem)] font-bold leading-none">
              <AnimatedNumber value={SEASON_STATS.totalPosters} />
            </p>
            <p className="mt-2 font-mono text-[10px] text-dim sm:text-xs">
              posters competing · season_01
            </p>
            <div className="mt-4 flex justify-center gap-6 font-mono text-[10px] sm:gap-10 sm:text-xs">
              <span>
                <span className="text-dim">POSTS </span>
                <span className="text-terminal">{SEASON_STATS.totalPosts.toLocaleString()}</span>
              </span>
              <span>
                <span className="text-dim">REACH </span>
                <span className="text-terminal">
                  {(SEASON_STATS.totalReach / 1_000_000).toFixed(1)}M
                </span>
              </span>
              <span>
                <span className="text-dim">LIKES </span>
                <span className="text-[#00f0ff]">
                  {(SEASON_STATS.totalLikes / 1000).toFixed(0)}K
                </span>
              </span>
            </div>
          </div>
        </motion.div>

        <motion.a
          href="#score"
          initial={{ opacity: 0 }}
          animate={{ opacity: bootDone ? 0.6 : 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-dim"
        >
          <ChevronDown size={14} className="animate-bounce" />
          decrypt_score
        </motion.a>
      </div>

      <LiveFeedTicker entries={tickerEntries.length ? tickerEntries : []} pinned />
    </section>
  );
}

function MetricCell({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-black/90 px-2 py-3 text-center font-mono sm:py-4">
      <p className="text-[8px] uppercase tracking-wider text-dim sm:text-[9px]">{label}</p>
      <p
        className={`mt-1 text-lg font-bold sm:text-2xl ${
          accent ? "text-[#ff0080]" : "text-terminal"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function RankPeek({
  rank,
  position,
}: {
  rank: LeaderboardEntry | undefined;
  position: "left" | "right";
}) {
  if (!rank) return null;
  return (
    <div
      className={`flex items-center gap-2 text-dim ${position === "right" ? "flex-row-reverse text-right" : ""}`}
    >
      <span className="text-terminal">#{rank.rank}</span>
      <span>@{rank.handle}</span>
      <span className="font-bold text-[#00f0ff]">{rank.score.toLocaleString()}</span>
    </div>
  );
}
