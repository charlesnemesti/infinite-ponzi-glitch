import { OFFICIAL_X_HANDLE, OFFICIAL_X_USER_ID } from "@/lib/social/config";

const PRODUCTION_APP_URL = "https://www.infiniteponsiglitch.fun";

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

/** OAuth redirect_uri — derived from APP_URL so it stays in sync with the live domain */
export function getTwitterCallbackUrl(): string {
  const base = getAppUrl().replace(/\/$/, "");
  return `${base}/api/auth/twitter/callback`;
}

export function isTwitterOAuthConfigured(): boolean {
  return Boolean(
    process.env.TWITTER_CLIENT_ID?.trim() &&
      process.env.TWITTER_CLIENT_SECRET?.trim() &&
      getAppUrl(),
  );
}

/** Social quest verification — launch tweet ID required; official account via env or @handle default */
export function isTwitterQuestsConfigured(): boolean {
  const hasLaunchTweet = Boolean(process.env.TWITTER_LAUNCH_TWEET_ID?.trim());
  const hasOfficial =
    Boolean(process.env.TWITTER_OFFICIAL_USER_ID?.trim()) ||
    Boolean(OFFICIAL_X_USER_ID) ||
    Boolean(process.env.NEXT_PUBLIC_OFFICIAL_X_HANDLE?.trim()) ||
    Boolean(OFFICIAL_X_HANDLE) ||
    hasLaunchTweet;
  return hasLaunchTweet && hasOfficial;
}

export function allowTwitterDevAuth(): boolean {
  // Never use mock auth when real OAuth credentials are present
  if (isTwitterOAuthConfigured()) return false;

  if (process.env.ALLOW_TWITTER_DEV === "false") return false;

  return (
    process.env.ALLOW_TWITTER_DEV === "true" ||
    process.env.NODE_ENV === "development"
  );
}

export function getMissingTwitterConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.TWITTER_CLIENT_ID?.trim()) missing.push("TWITTER_CLIENT_ID");
  if (!process.env.TWITTER_CLIENT_SECRET?.trim()) missing.push("TWITTER_CLIENT_SECRET");
  if (!getAppUrl()) missing.push("NEXT_PUBLIC_APP_URL");
  if (!process.env.TWITTER_LAUNCH_TWEET_ID?.trim()) missing.push("TWITTER_LAUNCH_TWEET_ID");
  if (
    !process.env.TWITTER_OFFICIAL_USER_ID?.trim() &&
    !process.env.NEXT_PUBLIC_OFFICIAL_X_HANDLE?.trim()
  ) {
    missing.push("TWITTER_OFFICIAL_USER_ID (optional — auto-resolved from official X handle)");
  }
  return missing;
}

export function getTwitterConfigStatus() {
  const oauthConfigured = isTwitterOAuthConfigured();
  const questsConfigured = isTwitterQuestsConfigured();
  const devFallback = allowTwitterDevAuth();
  const callbackUrl = getTwitterCallbackUrl();
  const legacyCallback = process.env.TWITTER_CALLBACK_URL?.trim() || null;
  const callbackMismatch =
    legacyCallback !== null && legacyCallback !== callbackUrl;

  return {
    configured: oauthConfigured,
    devFallback,
    questsConfigured,
    ready: oauthConfigured && !devFallback,
    missing: getMissingTwitterConfig(),
    callbackUrl,
    appUrl: getAppUrl(),
    /** Exact URL to register in developer.x.com → User authentication → Callback URLs */
    xPortalCallbackUrl: callbackUrl,
    callbackMismatch,
    ...(callbackMismatch
      ? {
          hint: `TWITTER_CALLBACK_URL (${legacyCallback}) does not match NEXT_PUBLIC_APP_URL. Register ${callbackUrl} in the X developer portal.`,
        }
      : {}),
    productionCallbackExample: `${PRODUCTION_APP_URL}/api/auth/twitter/callback`,
  };
}
