/** Official project X — https://x.com/InfPonsiGlitch */
export const OFFICIAL_X_HANDLE =
  process.env.NEXT_PUBLIC_OFFICIAL_X_HANDLE?.trim() || "InfPonsiGlitch";

/** Numeric user ID for @InfPonsiGlitch (follow quest verification) */
export const OFFICIAL_X_USER_ID =
  process.env.TWITTER_OFFICIAL_USER_ID?.trim() || "2077399136232439808";

export function hasOfficialX(): boolean {
  return Boolean(OFFICIAL_X_HANDLE);
}

export const OFFICIAL_X_URL = `https://x.com/${OFFICIAL_X_HANDLE}`;

export const OFFICIAL_X_FOLLOW_URL = `https://x.com/intent/follow?screen_name=${OFFICIAL_X_HANDLE}`;

export const LAUNCH_TWEET_URL = process.env.NEXT_PUBLIC_LAUNCH_TWEET_URL?.trim() ?? "";

export function hasLaunchTweet(): boolean {
  return Boolean(LAUNCH_TWEET_URL);
}

export function hasSocialLinks(): boolean {
  return hasOfficialX();
}

export const SOCIAL_LINKS = {
  x: OFFICIAL_X_URL,
  xFollow: OFFICIAL_X_FOLLOW_URL,
  launchTweet: LAUNCH_TWEET_URL,
} as const;

export function xMention(): string {
  return `@${OFFICIAL_X_HANDLE}`;
}
