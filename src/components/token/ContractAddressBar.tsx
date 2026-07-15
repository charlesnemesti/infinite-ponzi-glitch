"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { getCaRevealMs } from "@/lib/contest/config";
import {
  hasTokenCa,
  TOKEN_CA,
  TOKEN_EXPLORER_URL,
  TOKEN_SYMBOL,
  truncateCa,
} from "@/lib/token/config";

type ContractAddressBarProps = {
  variant?: "hero" | "navbar" | "footer";
  className?: string;
};

function useCaRevealed(): boolean {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const check = () => setRevealed(Date.now() >= getCaRevealMs());
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, []);

  return revealed;
}

function CaPendingBadge({ variant }: { variant: ContractAddressBarProps["variant"] }) {
  const label = "Ready 2 min after launch";

  if (variant === "navbar") {
    return (
      <span className="hidden border border-[#00f0ff]/40 bg-black/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#00f0ff] lg:inline-flex">
        {label}
      </span>
    );
  }

  if (variant === "footer") {
    return (
      <div className="font-mono text-xs">
        <p className="text-[10px] uppercase tracking-wider text-dim">{TOKEN_SYMBOL} :: CONTRACT</p>
        <p className="mt-2 text-[11px] uppercase tracking-wider text-[#00f0ff]">{label}</p>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center border border-[#00f0ff]/40 bg-black/80 px-3 py-1.5 font-mono backdrop-blur-sm">
      <span className="text-[10px] uppercase tracking-widest text-[#00f0ff] sm:text-xs">
        {TOKEN_SYMBOL} :: {label}
      </span>
    </div>
  );
}

export function ContractAddressBar({ variant = "hero", className = "" }: ContractAddressBarProps) {
  const [copied, setCopied] = useState(false);
  const revealed = useCaRevealed();
  const showCa = revealed && hasTokenCa();

  if (!showCa) {
    return <CaPendingBadge variant={variant} />;
  }

  const copyCa = async () => {
    try {
      await navigator.clipboard.writeText(TOKEN_CA);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  if (variant === "navbar") {
    return (
      <button
        type="button"
        onClick={copyCa}
        title={`Copy ${TOKEN_SYMBOL} CA`}
        className={`hidden items-center gap-1.5 border border-terminal/50 bg-black/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-terminal transition hover:border-terminal hover:text-[#00f0ff] lg:inline-flex ${className}`}
      >
        <span className="text-dim">CA</span>
        <span>{truncateCa(TOKEN_CA)}</span>
        {copied ? <Check size={10} className="text-terminal" /> : <Copy size={10} />}
      </button>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`font-mono text-xs ${className}`}>
        <p className="text-[10px] uppercase tracking-wider text-dim">{TOKEN_SYMBOL} :: CONTRACT</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="break-all text-terminal">{TOKEN_CA}</code>
          <button
            type="button"
            onClick={copyCa}
            className="btn-terminal-ghost inline-flex items-center gap-1 px-2 py-1 text-[10px]"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "COPIED" : "COPY"}
          </button>
          {TOKEN_EXPLORER_URL ? (
            <a
              href={TOKEN_EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-terminal-ghost inline-flex items-center gap-1 px-2 py-1 text-[10px] hover:text-[#00f0ff]"
            >
              <ExternalLink size={12} />
              EXPLORER
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-wrap items-center justify-center gap-2 border border-[#00f0ff]/40 bg-black/80 px-3 py-1.5 font-mono backdrop-blur-sm ${className}`}
    >
      <span className="text-[10px] uppercase tracking-widest text-[#00f0ff]">
        {TOKEN_SYMBOL} :: LIVE
      </span>
      <button
        type="button"
        onClick={copyCa}
        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-terminal transition hover:text-[#00f0ff] sm:text-xs"
        title="Copy contract address"
      >
        <span className="text-dim">CA</span>
        <span className="hidden sm:inline">{TOKEN_CA}</span>
        <span className="sm:hidden">{truncateCa(TOKEN_CA, 8, 6)}</span>
        {copied ? <Check size={12} className="text-terminal" /> : <Copy size={12} />}
      </button>
      {TOKEN_EXPLORER_URL ? (
        <a
          href={TOKEN_EXPLORER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-wider text-dim transition hover:text-[#00f0ff]"
        >
          <ExternalLink size={12} className="inline" />
        </a>
      ) : null}
    </div>
  );
}
