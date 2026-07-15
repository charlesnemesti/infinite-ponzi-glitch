"use client";

import {
  hasOfficialX,
  OFFICIAL_X_FOLLOW_URL,
  OFFICIAL_X_URL,
  xMention,
} from "@/lib/social/config";

type SocialLinksProps = {
  compact?: boolean;
  /** Navbar: single X icon only */
  iconOnly?: boolean;
  className?: string;
};

export function SocialLinks({
  compact = false,
  iconOnly = false,
  className = "",
}: SocialLinksProps) {
  if (!hasOfficialX()) return null;

  if (iconOnly || compact) {
    return (
      <a
        href={OFFICIAL_X_URL}
        target="_blank"
        rel="noopener noreferrer"
        title={xMention()}
        className={`btn-terminal-ghost inline-flex h-8 w-8 shrink-0 items-center justify-center text-[10px] hover:border-[#00f0ff] hover:text-[#00f0ff] ${className}`}
      >
        𝕏
      </a>
    );
  }

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
        {xMention()}
      </a>
      <a
        href={OFFICIAL_X_FOLLOW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-terminal inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px]"
      >
        FOLLOW {xMention()}
      </a>
    </div>
  );
}
