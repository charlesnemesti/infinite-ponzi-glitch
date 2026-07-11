"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { TwitterSession } from "@/types";
import { TwitterConnect } from "@/components/connect/TwitterConnect";
import { GlitchText, TerminalFrame } from "@/components/effects/Terminal";
import { useUser } from "@/hooks/useUser";

export function ScoreReveal() {
  const { user } = useUser();
  const [session, setSession] = useState<TwitterSession | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: TwitterSession) => setSession(data));
  }, []);

  const score = user?.score ?? session?.score ?? 0;
  const rank = user?.rank ?? "?";
  const username = user?.username ?? session?.username ?? "NODE";
  const refCode = user?.referral_code ?? "";

  const shareToX = () => {
    const base = window.location.origin;
    const ogUrl = `${base}/api/og/score?username=${encodeURIComponent(username)}&score=${score}&rank=${rank}&total=271&ref=${refCode}`;
    const text = encodeURIComponent(
      `> ATTENTION_SCORE: ${score.toLocaleString()} XP\n> RANK #${rank} on @Infinite_Ponzi_Glitch\n\nCan you beat me? 👇\n${base}?ref=${refCode}`,
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(ogUrl)}`, "_blank");
  };

  return (
    <section id="score" className="py-10">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <TerminalFrame title="score_buffer.dat — AWAITING INPUT">
          <div className="text-center font-mono">
            <p className="text-[10px] uppercase tracking-[0.2em] text-dim">
              {">"} TOP_SCORES :: ALL_TIME
            </p>
            <h3 className="mt-4 text-lg font-bold text-terminal">
              {session?.connected || user?.username
                ? "> SCORE_READY_IN_BUFFER"
                : "> WHERE_DO_YOU_RANK?"}
            </h3>
            <p className="mt-2 text-xs text-dim">
              {session?.connected
                ? "Execute REVEAL then POST TO X"
                : "Connect X to claim rank slot in matrix"}
            </p>

            {session?.connected ? (
              <div className="mt-6 space-y-4">
                {revealed ? (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                    <p className="text-[10px] text-dim">ATTENTION_SCORE ::</p>
                    <GlitchText as="p" className="text-5xl font-bold text-terminal">
                      {score.toLocaleString()}
                    </GlitchText>
                    {user?.rank ? (
                      <p className="mt-2 text-sm text-[#00f0ff]">RANK #{rank}</p>
                    ) : null}
                  </motion.div>
                ) : (
                  <button type="button" onClick={() => setRevealed(true)} className="btn-terminal mt-2">
                    {">"} REVEAL_SCORE
                  </button>
                )}
                {revealed && (
                  <button type="button" onClick={shareToX} className="btn-terminal-ghost w-full text-xs">
                    {">"} POST_TO_X
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-6">
                <TwitterConnect />
              </div>
            )}
          </div>
        </TerminalFrame>
      </div>
    </section>
  );
}
