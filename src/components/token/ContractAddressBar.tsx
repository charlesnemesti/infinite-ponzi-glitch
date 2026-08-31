"use client";

import { TOKEN_SYMBOL } from "@/lib/token/config";

type ContractAddressBarProps = {
  variant?: "hero" | "navbar" | "footer";
  className?: string;
};

const LABEL = "TBA after launch";
const SHORT_LABEL = "TBA · AFTER LAUNCH";

export function ContractAddressBar({ variant = "hero", className = "" }: ContractAddressBarProps) {
  if (variant === "navbar") {
    return (
      <span className="hidden whitespace-nowrap border border-[#00f0ff]/40 bg-black/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#00f0ff] 2xl:inline-flex">
        {SHORT_LABEL}
      </span>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`font-mono text-xs ${className}`}>
        <p className="text-[10px] uppercase tracking-wider text-dim">{TOKEN_SYMBOL} :: CONTRACT</p>
        <p className="mt-2 text-[11px] uppercase tracking-wider text-[#00f0ff]">{LABEL}</p>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center border border-[#00f0ff]/40 bg-black/80 px-3 py-1.5 font-mono backdrop-blur-sm ${className}`}
    >
      <span className="text-[10px] uppercase tracking-widest text-[#00f0ff] sm:text-xs">
        {TOKEN_SYMBOL} :: {LABEL}
      </span>
    </div>
  );
}
