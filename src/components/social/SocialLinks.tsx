"use client";

import {
  hasOfficialX,
  OFFICIAL_X_FOLLOW_URL,
  OFFICIAL_X_URL,
  xMention,
} from "@/lib/social/config";

type SocialLinksProps = {
  compact?: boolean;
  className?: string;
};

export function SocialLinks({ compact = false, className = "" }: SocialLinksProps) {
  if (!hasOfficialX()) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 font-mono ${className}`}>
      <a
        href={OFFICIAL_X_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-terminal-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] hover:border-[#00f0ff] hover:text-[#00f0ff]"
        title={xMention()}
      >
        <span>𝕏</span>
        {compact ? "X" : xMention()}
      </a>
      <a
        href={OFFICIAL_X_FOLLOW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-terminal inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px]"
      >
        {compact ? "FOLLOW" : `FOLLOW ${xMention()}`}
      </a>
    </div>
  );
}
