"use client";

import { useEffect, useState } from "react";
import { CONTEST_START_UTC_LABEL, getContestStartMs } from "@/lib/contest/config";

type TimeLeft = { hours: number; minutes: number; seconds: number; total: number };

function calcTimeLeft(targetMs: number): TimeLeft {
  const total = Math.max(0, targetMs - Date.now());
  const hours = Math.floor(total / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  return { hours, minutes, seconds, total };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function BombCountdown() {
  const targetMs = getContestStartMs();
  const [left, setLeft] = useState<TimeLeft>(() => calcTimeLeft(targetMs));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => setLeft(calcTimeLeft(targetMs));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const live = left.total <= 0;
  const critical = !live && left.total <= 5 * 60_000;

  if (!mounted) {
    return (
      <div className="bomb-countdown mb-6 min-h-[8rem] border border-[#ff0080]/40 bg-black/80 px-4 py-4 font-mono sm:px-6" />
    );
  }

  return (
    <div
      className={`bomb-countdown relative mb-6 overflow-hidden border font-mono ${
        live
          ? "border-terminal bg-terminal/10"
          : critical
            ? "border-[#ff0080] bg-[#ff0080]/10 bomb-shake"
            : "border-[#ffff00]/50 bg-[#1a0a00]/90"
      }`}
    >
      <div className="bomb-scanline pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative border-b border-[#ffff00]/20 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#ff0080] sm:text-xs">
              {live ? "☢ CONTEST_LIVE" : "☢ CONTEST_ARMED"}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-dim">
              {live ? "detonation complete · rank matrix unlocked" : "t-minus to go-live"}
            </p>
          </div>

          <div className="text-right">
            {live ? (
              <div className="bomb-digits-live text-3xl font-bold tracking-widest text-terminal sm:text-4xl">
                [GO]
              </div>
            ) : (
              <>
                <div
                  className={`bomb-digits inline-flex gap-1 text-3xl font-bold tabular-nums sm:text-4xl ${
                    critical ? "text-[#ff0080]" : "text-[#ffff00]"
                  }`}
                >
                  <span>{pad(left.hours)}</span>
                  <span className="bomb-colon">:</span>
                  <span>{pad(left.minutes)}</span>
                  <span className="bomb-colon">:</span>
                  <span>{pad(left.seconds)}</span>
                </div>
                <p className="mt-1 text-[9px] uppercase tracking-wider text-dim">
                  detonation @ {CONTEST_START_UTC_LABEL}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative space-y-2 px-4 py-3 text-[10px] leading-relaxed sm:px-6 sm:text-xs">
        {live ? (
          <>
            <Row label="STATUS" value="contest active" accent />
            <Row label="PAYOUT" value="99% daily taxes → top 10" />
            <Row label="MISSION" value="stack XP · climb rank · post on X" />
            <p className="pt-1 text-dim">
              The degen legion is live.{" "}
              <span className="text-terminal">IPG</span> is the onchain Ponsi movement — inject or
              get left behind.
            </p>
          </>
        ) : (
          <>
            <Row label="NOW" value="preview mode · simulated ranks only" />
            <Row label="AT GO" value={`${CONTEST_START_UTC_LABEL} · real contest unlocks`} accent />
            <Row label="PAYOUT" value="99% daily taxes → top 10 rank" />
            <ul className="space-y-1 pt-1 text-dim">
              <li>
                <span className="text-[#ffff00]">{">"}</span> Degen legion deploys on X
              </li>
              <li>
                <span className="text-[#ffff00]">{">"}</span>{" "}
                <span className="text-terminal">IPG</span> becomes the Ponsi wave onchain
              </li>
              <li>
                <span className="text-[#ffff00]">{">"}</span> Climb rank — taxes split to top 10 every UTC day
              </li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
      <span className="shrink-0 uppercase tracking-wider text-dim">{label}</span>
      <span className={accent ? "text-[#ffff00]" : "text-foreground/90"}>{value}</span>
    </div>
  );
}
