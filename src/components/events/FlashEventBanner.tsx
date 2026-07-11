"use client";

import { useEffect, useState } from "react";

type FlashEvent = {
  active: boolean;
  multiplier?: number;
  remaining_ms?: number;
};

export function FlashEventBanner() {
  const [event, setEvent] = useState<FlashEvent | null>(null);
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    fetch("/api/events/active")
      .then((r) => r.json())
      .then(setEvent);
  }, []);

  useEffect(() => {
    if (!event?.active || !event.remaining_ms) return;
    const tick = () => {
      setEvent((prev) => {
        if (!prev?.remaining_ms) return prev;
        const next = Math.max(0, prev.remaining_ms - 1000);
        const h = Math.floor(next / 3600000);
        const m = Math.floor((next % 3600000) / 60000);
        setRemaining(`${h}H ${m}M`);
        return { ...prev, remaining_ms: next };
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [event?.active]);

  if (!event?.active) return null;

  return (
    <div className="fixed left-0 right-0 top-14 z-40 border-b border-[#ff0080] bg-black/95 px-4 py-2 text-center font-mono backdrop-blur-sm">
      <p className="text-xs uppercase tracking-widest">
        <span className="animate-pulse text-[#ff0080]">[GLITCH_EVENT]</span>
        <span className="mx-2 text-terminal">{event.multiplier}x XP ACTIVE</span>
        <span className="text-dim">· {remaining} REMAINING</span>
      </p>
    </div>
  );
}
