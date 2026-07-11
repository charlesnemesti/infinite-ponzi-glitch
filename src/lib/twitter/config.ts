export function isTwitterOAuthConfigured(): boolean {
  return Boolean(
    process.env.TWITTER_CLIENT_ID?.trim() &&
      process.env.TWITTER_CLIENT_SECRET?.trim() &&
      process.env.TWITTER_CALLBACK_URL?.trim(),
  );
}

export function isTwitterQuestsConfigured(): boolean {
  return Boolean(
    process.env.TWITTER_OFFICIAL_USER_ID?.trim() &&
      process.env.TWITTER_LAUNCH_TWEET_ID?.trim(),
  );
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
  if (!process.env.TWITTER_CALLBACK_URL?.trim()) missing.push("TWITTER_CALLBACK_URL");
  if (!process.env.TWITTER_OFFICIAL_USER_ID?.trim()) missing.push("TWITTER_OFFICIAL_USER_ID");
  if (!process.env.TWITTER_LAUNCH_TWEET_ID?.trim()) missing.push("TWITTER_LAUNCH_TWEET_ID");
  if (!process.env.NEXT_PUBLIC_APP_URL?.trim()) missing.push("NEXT_PUBLIC_APP_URL");
  return missing;
}

export function getTwitterConfigStatus() {
  const oauthConfigured = isTwitterOAuthConfigured();
  const questsConfigured = isTwitterQuestsConfigured();
  const devFallback = allowTwitterDevAuth();

  return {
    configured: oauthConfigured,
    devFallback,
    questsConfigured,
    ready: oauthConfigured && !devFallback,
    missing: getMissingTwitterConfig(),
    callbackUrl: process.env.TWITTER_CALLBACK_URL ?? null,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
  };
}
