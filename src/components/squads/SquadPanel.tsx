"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";

type SquadEntry = {
  name: string;
  invite_code: string;
  total_score: number;
  members: number;
};

export function SquadPanel() {
  const { user, address } = useUser();
  const [squads, setSquads] = useState<SquadEntry[]>([]);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/squads")
      .then((r) => r.json())
      .then((d) => setSquads(d.squads ?? []));
  }, []);

  const createSquad = async () => {
    if (!address || !name) return;
    const res = await fetch("/api/squads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: address, name }),
    });
    const data = await res.json();
    if (data.squad) {
      setMsg(`Squad created · code ${data.squad.invite_code}`);
      const lb = await fetch("/api/squads").then((r) => r.json());
      setSquads(lb.squads ?? []);
    } else {
      setMsg(data.error ?? "failed");
    }
  };

  const joinSquad = async () => {
    if (!address || !joinCode) return;
    const res = await fetch("/api/squads/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: address, invite_code: joinCode }),
    });
    const data = await res.json();
    setMsg(data.squad ? `Joined ${data.squad.name}` : (data.error ?? "failed"));
  };

  return (
    <section id="squads" className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 font-mono">
          <p className="text-xs uppercase tracking-[0.2em] text-[#00f0ff]">
            {">"} SQUAD_MATRIX
          </p>
          <h2 className="mt-2 text-3xl font-bold text-terminal">CLANS · 5-10 NODES</h2>
          <p className="mt-2 text-xs text-dim">
            Form a squad. Team multiplier when all members complete daily quests.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="terminal-frame p-4 font-mono">
            {!user?.squad_id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="SQUAD_NAME"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-terminal bg-black px-3 py-2 text-sm text-terminal outline-none"
                />
                <button type="button" onClick={createSquad} className="btn-terminal w-full text-xs">
                  CREATE_SQUAD
                </button>
                <input
                  type="text"
                  placeholder="INVITE_CODE"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full border border-terminal bg-black px-3 py-2 text-sm text-terminal outline-none"
                />
                <button type="button" onClick={joinSquad} className="btn-terminal-ghost w-full text-xs">
                  JOIN_SQUAD
                </button>
              </div>
            ) : (
              <p className="text-sm text-terminal">[IN_SQUAD] · sync complete</p>
            )}
            {msg && <p className="mt-2 text-[10px] text-dim">{msg}</p>}
          </div>

          <div className="border border-terminal bg-black/60 p-4 font-mono">
            <p className="mb-3 text-[10px] uppercase text-dim">squad_leaderboard</p>
            <ul className="space-y-2">
              {squads.length === 0 ? (
                <li className="text-xs text-dim">No squads yet</li>
              ) : (
                squads.map((s, i) => (
                  <li key={s.invite_code} className="flex justify-between text-xs">
                    <span>
                      <span className="text-[#ffff00]">#{i + 1}</span> {s.name}{" "}
                      <span className="text-dim">({s.members}/10)</span>
                    </span>
                    <span className="text-terminal">{s.total_score.toLocaleString()}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
