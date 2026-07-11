"use client";

import { useUser } from "@/hooks/useUser";
import { MOCK_QUESTS } from "@/lib/data/mock-leaderboard-quests";
import { TerminalFrame } from "@/components/effects/Terminal";

function truncateWallet(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function NodeProfilePanel() {
  const { user, completedQuests, walletConnected, twitterConnected, address, loading } =
    useUser();

  if (!walletConnected && !twitterConnected) return null;

  const totalQuests = MOCK_QUESTS.length;
  const doneCount = completedQuests.length;
  const score = user?.score ?? 0;

  return (
    <section id="profile" className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <TerminalFrame title="node_profile.dat — ACTIVE SESSION">
          <div className="grid gap-6 font-mono md:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#00f0ff]">
                {">"} operator_identity
              </p>
              <div className="mt-3 space-y-2 text-[11px]">
                <Row label="WALLET" value={address ? truncateWallet(address) : "—"} />
                <Row
                  label="X_HANDLE"
                  value={user?.username ? `@${user.username}` : twitterConnected ? "linked" : "—"}
                />
                <Row label="REF_CODE" value={user?.referral_code ?? "—"} />
              </div>

              <div className="mt-5 border-t border-terminal/30 pt-4">
                <p className="text-[10px] uppercase text-dim">total_attention_score</p>
                <p className="mt-1 text-4xl font-bold text-terminal">
                  {loading && !user ? "···" : score.toLocaleString()}
                  <span className="ml-1 text-base text-dim">XP</span>
                </p>
                <p className="mt-2 text-[11px] text-[#00f0ff]">
                  RANK #{user?.rank ?? "—"} · {doneCount}/{totalQuests} quests cleared
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#ff0080]">
                {">"} quest_completion_log
              </p>
              <ul className="mt-3 max-h-48 space-y-1.5 overflow-y-auto text-[11px]">
                {MOCK_QUESTS.map((q) => {
                  const done = completedQuests.includes(q.id);
                  return (
                    <li
                      key={q.id}
                      className="flex items-center justify-between gap-2 border border-terminal/20 bg-black/50 px-2 py-1.5"
                    >
                      <span className={done ? "text-terminal" : "text-dim"}>{q.title}</span>
                      <span className="shrink-0 text-[10px]">
                        {done ? (
                          <span className="text-terminal">[+{q.reward} XP] DONE</span>
                        ) : (
                          <span className="text-dim">+{q.reward} XP</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </TerminalFrame>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-dim">{label}</span>
      <span className="truncate text-terminal">{value}</span>
    </div>
  );
}
