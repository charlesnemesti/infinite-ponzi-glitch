"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { TerminalFrame } from "@/components/effects/Terminal";

export function RewardsSection() {
  return (
    <section id="rewards" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <TerminalFrame title="reward_pool.exe — ALLOCATING">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="font-mono">
              <div className="mb-4 inline-flex items-center gap-2 border border-terminal px-3 py-1 text-[10px] uppercase tracking-wider text-terminal">
                <Gift size={12} />
                AIRDROP_INJECT
              </div>
              <h2 className="text-3xl font-bold uppercase leading-tight text-terminal sm:text-4xl">
                30% SUPPLY
                <br />
                <span className="text-[#ff0080]">FOR EARLY NODES</span>
              </h2>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-dim">
                {">"} Accumulate XP via quest execution and rank matrix performance.
                <br />
                {">"} Distribution method: TBD [MANUAL | SMART_CONTRACT]
                <br />
                {">"} Announced before season end. No guarantees. Stack at own risk.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 font-mono">
              <RewardCard title="QUEST_XP" desc="Base points from mission execution" value="6 ACTIVE" />
              <RewardCard title="SOCIAL_BOOST" desc="X engagement multiplier" value="UP TO 10x" />
              <RewardCard title="REFERRAL_LOOP" desc="Invite nodes via unique code" value="NEXT PATCH" />
              <RewardCard title="RANK_BONUS" desc="Top matrix positions" value="TOP 100" />
            </div>
          </div>
        </TerminalFrame>
      </div>
    </section>
  );
}

function RewardCard({
  title,
  desc,
  value,
}: {
  title: string;
  desc: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{ borderColor: "rgba(0,255,65,0.8)" }}
      className="border border-terminal/50 bg-black/60 p-4"
    >
      <p className="text-xs font-bold text-terminal">{title}</p>
      <p className="mt-1 text-[10px] text-dim">{desc}</p>
      <p className="mt-3 text-sm font-bold text-[#00f0ff]">{value}</p>
    </motion.div>
  );
}
