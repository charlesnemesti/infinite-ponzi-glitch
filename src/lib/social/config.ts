/** Official project X — https://x.com/IPG_Robinhood */
export const OFFICIAL_X_HANDLE =
  process.env.NEXT_PUBLIC_OFFICIAL_X_HANDLE?.trim() || "IPG_Robinhood";

/** Numeric user ID for @IPG_Robinhood (follow quest verification) */
export const OFFICIAL_X_USER_ID = process.env.TWITTER_OFFICIAL_USER_ID?.trim() || "";

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
