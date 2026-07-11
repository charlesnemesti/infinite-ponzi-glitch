"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { UserProfile } from "@/types";

type ReferralPanelProps = {
  user: UserProfile | null;
};

export function ReferralPanel({ user }: ReferralPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!user?.referral_code) return null;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${baseUrl}?ref=${user.referral_code}`;

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="terminal-frame glitch-hover-frame">
      <div className="terminal-titlebar">
        <span className="terminal-dots">● ● ●</span>
        <span>invite_node.exe</span>
      </div>
      <div className="space-y-3 p-4 font-mono">
        <p className="text-[10px] uppercase tracking-wider text-[#ff0080]">
          {">"} REFERRAL_LOOP · +2000 XP · x5
        </p>
        <p className="text-xs text-dim">
          Share your link. Both nodes earn when referee connects wallet + X + completes quests.
        </p>
        <div className="flex items-center gap-2 border border-terminal bg-black p-2">
          <code className="flex-1 truncate text-[10px] text-terminal">{link}</code>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 border border-terminal p-1.5 text-terminal hover:bg-terminal/10"
            aria-label="Copy referral link"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <p className="text-[10px] text-dim">CODE :: {user.referral_code}</p>
      </div>
    </div>
  );
}
