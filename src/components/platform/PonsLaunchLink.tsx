"use client";

import { ExternalLink } from "lucide-react";
import { hasPonsLaunchpad, PONS_LAUNCHPAD_URL } from "@/lib/platform/config";

type PonsLaunchLinkProps = {
  variant?: "hero" | "compact";
  className?: string;
};

export function PonsLaunchLink({ variant = "hero", className = "" }: PonsLaunchLinkProps) {
  if (!hasPonsLaunchpad()) return null;

  if (variant === "compact") {
    return (
      <a
        href={PONS_LAUNCHPAD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn-terminal-ghost inline-flex items-center gap-1 px-2 py-1 text-[10px] hover:text-[#00f0ff] ${className}`}
      >
        PONS
        <ExternalLink size={10} />
      </a>
    );
  }

  return (
    <a
      href={PONS_LAUNCHPAD_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-terminal inline-flex items-center gap-1.5 text-[10px] sm:text-xs ${className}`}
    >
      {">"} TRADE_ON_PONS
      <ExternalLink size={12} />
    </a>
  );
}
