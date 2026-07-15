"use client";

import { useEffect, useState } from "react";
import { BRAND_SHORT } from "@/lib/brand/config";

const GLITCH_CHARS = "█▓▒░╔═╗╚╝║@#$%&*!?01▄▀";

type CorruptTextProps = {
  text: string;
  className?: string;
  active?: boolean;
};

export function CorruptText({ text, className, active = true }: CorruptTextProps) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    setDisplay(text);
  }, [text]);

  useEffect(() => {
    if (!active) return;

    const corrupt = () => {
      const corrupted = text
        .split("")
        .map((char) =>
          char === " " || Math.random() > 0.12
            ? char
            : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)],
        )
        .join("");
      setDisplay(corrupted);
      setTimeout(() => setDisplay(text), 60 + Math.random() * 120);
    };

    const id = setInterval(() => {
      if (Math.random() > 0.65) corrupt();
    }, 2200 + Math.random() * 3000);

    return () => clearInterval(id);
  }, [text, active]);

  return <span className={className}>{display}</span>;
}

export function ScreenTear() {
  const [tear, setTear] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    const trigger = () => {
      if (Math.random() > 0.55) {
        setTear({
          top: Math.random() * 80,
          height: 2 + Math.random() * 8,
        });
        setTimeout(() => setTear(null), 80 + Math.random() * 150);
      }
    };

    const id = setInterval(trigger, 4000 + Math.random() * 6000);
    return () => clearInterval(id);
  }, []);

  if (!tear) return null;

  return (
    <div
      className="screen-tear pointer-events-none fixed inset-x-0 z-[9997]"
      style={{ top: `${tear.top}%`, height: `${tear.height}px` }}
      aria-hidden
    />
  );
}

const FLOAT_LINES = [
  "0xDEADBEEF",
  "PONSI_LOOP++",
  "GLIITCH.exe",
  "STACK_OVERFLOW",
  "malloc(∞)",
  "SEG_FAULT",
  "ATTENTION_FI",
  "PONS.FAMILY",
  "ERR_NULL_PTR",
  "while(true){",
  "INJECT_OK",
  "█▓▒░",
  "VLADtenev",
  "0x7FFF",
  "NODE_SYNC",
];

export function GlitchBackground() {
  const [lines, setLines] = useState<
    { id: number; text: string; x: number; y: number; opacity: number; dur: number }[]
  >([]);

  useEffect(() => {
    setLines(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        text: FLOAT_LINES[i % FLOAT_LINES.length],
        x: Math.random() * 95,
        y: Math.random() * 95,
        opacity: 0.04 + Math.random() * 0.08,
        dur: 8 + Math.random() * 14,
      })),
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {lines.map((line) => (
        <span
          key={line.id}
          className="glitch-float absolute font-mono text-[10px] uppercase tracking-widest text-terminal sm:text-xs"
          style={{
            left: `${line.x}%`,
            top: `${line.y}%`,
            opacity: line.opacity,
            animationDuration: `${line.dur}s`,
            animationDelay: `${line.id * 0.4}s`,
          }}
        >
          {line.text}
        </span>
      ))}
      <div className="crt-vignette absolute inset-0" />
    </div>
  );
}

export function AmbientScanBeam() {
  return (
    <div className="ambient-scan-beam pointer-events-none fixed inset-0 z-[9995] overflow-hidden" aria-hidden>
      <div className="ambient-scan-line" />
    </div>
  );
}

export function StatusBar() {
  const [time, setTime] = useState("");
  const [block, setBlock] = useState(8_421_337);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.9);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toISOString().replace("T", " ").slice(0, 19));
      if (Math.random() > 0.7) setBlock((b) => b + Math.floor(Math.random() * 3));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!visible) return null;

  return (
    <div className="status-bar fixed inset-x-0 bottom-0 z-50 flex items-center justify-between border-t border-terminal bg-black/95 px-3 py-1 font-mono text-[9px] uppercase tracking-wider sm:px-6 sm:text-[10px]">
      <span className="text-terminal">{BRAND_SHORT.toUpperCase()}://PONS</span>
      <span className="hidden text-dim sm:inline">BLK::{block.toLocaleString()}</span>
      <span className="hidden text-[#00f0ff] sm:inline">NODES::271</span>
      <span className="animate-pulse text-[#ff0080]">[GLIITCH_ACTIVE]</span>
      <span className="text-dim">{time} UTC</span>
    </div>
  );
}
