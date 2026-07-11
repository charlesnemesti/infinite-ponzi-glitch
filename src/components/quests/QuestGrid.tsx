"use client";

import { motion } from "framer-motion";
import {
  Lock,
  Loader2,
  PenLine,
  Repeat2,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { LAUNCH_TWEET_URL, OFFICIAL_X_FOLLOW_URL, xMention } from "@/lib/social/config";
import type { Quest } from "@/types";

type QuestGridProps = {
  quests: Quest[];
};

function QuestIcon({ icon }: { icon: string }) {
  const cls = "text-terminal";
  switch (icon) {
    case "twitter":
      return <span className="font-bold text-terminal">𝕏</span>;
    case "follow":
      return <UserPlus size={20} className={cls} />;
    case "retweet":
      return <Repeat2 size={20} className={cls} />;
    case "users":
      return <Users size={20} className={cls} />;
    case "pen":
      return <PenLine size={20} className={cls} />;
    default:
      return <Wallet size={20} className={cls} />;
  }
}

const QUEST_LINKS: Record<string, { href: string; label: string } | undefined> = {
  "follow-project": { href: OFFICIAL_X_FOLLOW_URL, label: "OPEN X" },
  "retweet-launch": { href: LAUNCH_TWEET_URL, label: "VIEW PIN" },
};

const FOLLOW_INTENT_KEY = "ipg_follow_intent_at";

function markFollowIntent() {
  sessionStorage.setItem(FOLLOW_INTENT_KEY, String(Date.now()));
}

const CATEGORY_STYLE = {
  social: "border-[#00f0ff]/30 hover:border-[#00f0ff]/60",
  onchain: "border-terminal hover:border-terminal",
  referral: "border-[#ff0080]/30 hover:border-[#ff0080]/60",
  content: "border-[#ffff00]/30 hover:border-[#ffff00]/60",
};

function isQuestLocked(questId: string, completed: string[], isConnected: boolean, twitterConnected: boolean): boolean {
  if (completed.includes(questId)) return false;
  if (questId === "connect-wallet" || questId === "connect-x") return false;
  if (!isConnected || !twitterConnected) return true;
  if (questId === "follow-project" || questId === "retweet-launch") return false;
  if (questId === "invite-friend") return !completed.includes("connect-x");
  return true;
}

export function QuestGrid({ quests }: QuestGridProps) {
  const { isConnected, completedQuests, completeQuest, twitterConnected } = useUser();
  const [executing, setExecuting] = useState<string | null>(null);
  const [questErrors, setQuestErrors] = useState<Record<string, string>>({});

  const handleExec = async (questId: string) => {
    setExecuting(questId);
    setQuestErrors((prev) => {
      const next = { ...prev };
      delete next[questId];
      return next;
    });
    const result = await completeQuest(questId);
    if (!result.ok) {
      setQuestErrors((prev) => ({
        ...prev,
        [questId]: result.error ?? "Execution failed",
      }));
    }
    setExecuting(null);
  };

  return (
    <section id="quests" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 font-mono">
          <p className="text-xs uppercase tracking-[0.2em] text-[#ff0080]">
            {">"} QUEST_LOG :: ACTIVE
          </p>
          <h2 className="mt-2 text-3xl font-bold uppercase text-terminal sm:text-4xl">
            INJECT // EARN // REPEAT
          </h2>
          <p className="mt-2 max-w-2xl text-xs text-dim">
            {">"} Execute missions for real XP. Wallet + X required for social exploits.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quests.map((quest, i) => {
            const completed = completedQuests.includes(quest.id);
            const locked = isQuestLocked(quest.id, completedQuests, isConnected, twitterConnected);
            const questError = questErrors[quest.id];

            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`group relative overflow-hidden border bg-black/80 p-5 font-mono transition glitch-hover-frame ${CATEGORY_STYLE[quest.category]} ${
                  locked && !completed ? "opacity-50" : ""
                }`}
              >
                {quest.multiplier && (
                  <span className="absolute right-3 top-3 border border-terminal bg-terminal px-1.5 py-0.5 text-[9px] font-bold text-black">
                    x{quest.multiplier}
                  </span>
                )}

                <div className="mb-3 flex h-10 w-10 items-center justify-center border border-terminal/50 bg-black">
                  <QuestIcon icon={quest.icon} />
                </div>

                <p className="text-[10px] uppercase tracking-wider text-dim">[{quest.category}]</p>
                <h3 className="mt-1 text-sm font-bold text-terminal">{quest.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-dim">{quest.description}</p>
                {questError && (
                  <p className="mt-2 text-[10px] leading-snug text-[#ff0080]">{questError}</p>
                )}

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase text-dim">REWARD</p>
                    <p className="text-lg font-bold text-[#00f0ff]">+{quest.reward.toLocaleString()} XP</p>
                  </div>

                  {completed ? (
                    <span className="border border-terminal px-2 py-1 text-[10px] font-bold text-terminal">
                      [DONE]
                    </span>
                  ) : locked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-dim">
                      <Lock size={10} />
                      LOCKED
                    </span>
                  ) : quest.id === "invite-friend" ? (
                    <span className="text-[10px] text-dim">VIA REFERRAL</span>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      {QUEST_LINKS[quest.id] && (
                        <a
                          href={QUEST_LINKS[quest.id]!.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={quest.id === "follow-project" ? markFollowIntent : undefined}
                          className="text-[9px] text-[#00f0ff] hover:underline"
                        >
                          {QUEST_LINKS[quest.id]!.label}
                        </a>
                      )}
                      <button
                      type="button"
                      disabled={executing === quest.id}
                      onClick={() => handleExec(quest.id)}
                      className="btn-terminal flex items-center gap-1 px-3 py-1.5 text-[10px] disabled:opacity-50"
                    >
                      {executing === quest.id ? <Loader2 size={12} className="animate-spin" /> : null}
                      EXEC
                    </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
