"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { TerminalFrame } from "@/components/effects/Terminal";
import {
  DAILY_TOP_RANK_COUNT,
  TAX_TO_TOP_TEN_PERCENT,
  TOKENOMICS_DESCRIPTION,
  TOKENOMICS_HEADLINE,
  TOKENOMICS_SUBHEADLINE,
} from "@/lib/tokenomics/config";

export function RewardsSection() {
  return (
    <section id="rewards" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <TerminalFrame title="tax_router.exe — DAILY_PAYOUT">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="font-mono">
              <div className="mb-4 inline-flex items-center gap-2 border border-terminal px-3 py-1 text-[10px] uppercase tracking-wider text-terminal">
                <Gift size={12} />
                DAILY_TAX_SPLIT
              </div>
              <h2 className="text-3xl font-bold uppercase leading-tight text-terminal sm:text-4xl">
                {TOKENOMICS_HEADLINE}
                <br />
                <span className="text-[#ff0080]">{TOKENOMICS_SUBHEADLINE}</span>
              </h2>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-dim">
                {">"} {TOKENOMICS_DESCRIPTION}
                <br />
                {">"} Snapshot at UTC midnight · payout to top {DAILY_TOP_RANK_COUNT} wallets
                <br />
                {">"} No guarantees. Rank can change every cycle. Stack at own risk.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 font-mono">
              <RewardCard
                title="TAX_SPLIT"
                desc="Share of daily taxes to rank pool"
                value={`${TAX_TO_TOP_TEN_PERCENT}%`}
              />
              <RewardCard
                title="WINNERS"
                desc="Top matrix nodes each UTC day"
                value={`TOP ${DAILY_TOP_RANK_COUNT}`}
              />
              <RewardCard title="QUEST_XP" desc="Stack rank via mission execution" value="6 ACTIVE" />
              <RewardCard title="PAYOUT" desc="Automatic daily distribution" value="ONCHAIN" />
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
