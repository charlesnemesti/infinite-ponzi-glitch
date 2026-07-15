"use client";

import { useEffect, useState } from "react";
import { CorruptText } from "@/components/effects/GlitchEffects";
import clsx from "clsx";

const BOOT_LINES: { text: string; type?: "ok" | "warn" | "err" }[] = [
  { text: "> BOOT::INFINITE_PONSI_GLIITCH v0.9.9" },
  { text: "> PLATFORM::PONS............ OK", type: "ok" },
  { text: "> ATTENTION_FI.dll.......... OK", type: "ok" },
  { text: "> WARN::PONSI_LOOP @ 0x7FFF", type: "warn" },
  { text: "> TAX::99% TO TOP10 DAILY", type: "ok" },
  { text: "> ERR::STACK OVERFLOW — GO", type: "err" },
  { text: "> SYSTEM READY.", type: "ok" },
];

const TYPE_COLOR = {
  ok: "text-terminal",
  warn: "text-[#ffff00]",
  err: "text-[#ff0080]",
};

type BootSequenceProps = {
  compact?: boolean;
  onComplete?: () => void;
};

export function BootSequence({ compact = false, onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (visibleLines >= BOOT_LINES.length) {
      setDone(true);
      return;
    }
    const delay = BOOT_LINES[visibleLines].type === "err" ? 450 : 280;
    const timer = setTimeout(() => setVisibleLines((v) => v + 1), delay);
    return () => clearTimeout(timer);
  }, [visibleLines]);

  useEffect(() => {
    if (done) onComplete?.();
  }, [done, onComplete]);

  return (
    <div className={clsx("terminal-frame h-full", compact ? "min-h-0" : "max-w-2xl")}>
      <div className="terminal-titlebar">
        <span className="terminal-dots">● ● ●</span>
        <span>boot_sequence.sh</span>
        {done && <span className="ml-auto text-terminal">[OK]</span>}
      </div>
      <div
        className={clsx(
          "space-y-0.5 p-3 font-mono sm:p-4",
          compact ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-xs",
        )}
      >
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <p
            key={line.text}
            className={clsx(
              line.type ? TYPE_COLOR[line.type] : "text-dim",
              i === visibleLines - 1 && !done && "cursor-blink",
              line.type === "err" && "glitch-line",
            )}
          >
            {line.text}
          </p>
        ))}
        {done && (
          <p className="mt-1 text-terminal opacity-80">
            {">"} <CorruptText text="AWAITING INPUT_" active />
          </p>
        )}
      </div>
    </div>
  );
}
