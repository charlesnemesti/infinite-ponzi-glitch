/** Official project X account — https://x.com/Infinite_Ponzi */
export const OFFICIAL_X_HANDLE =
  process.env.NEXT_PUBLIC_OFFICIAL_X_HANDLE ?? "Infinite_Ponzi";
export const OFFICIAL_X_URL = `https://x.com/${OFFICIAL_X_HANDLE}`;
export const OFFICIAL_X_FOLLOW_URL = `https://x.com/intent/follow?screen_name=${OFFICIAL_X_HANDLE}`;

/** Set when launch tweet is pinned — e.g. https://x.com/Infinite_Ponzi/status/123... */
export const LAUNCH_TWEET_URL =
  process.env.NEXT_PUBLIC_LAUNCH_TWEET_URL ?? OFFICIAL_X_URL;

export const SOCIAL_LINKS = {
  x: OFFICIAL_X_URL,
  xFollow: OFFICIAL_X_FOLLOW_URL,
  launchTweet: LAUNCH_TWEET_URL,
} as const;

export function xMention() {
  return `@${OFFICIAL_X_HANDLE}`;
}
