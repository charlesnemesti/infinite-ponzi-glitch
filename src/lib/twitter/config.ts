import { OFFICIAL_X_HANDLE, OFFICIAL_X_USER_ID } from "@/lib/social/config";
import { getAppUrl, getTwitterCallbackUrl, PRODUCTION_CALLBACK, PRODUCTION_CALLBACK_NO_WWW } from "@/lib/twitter/env";
import { TWITTER_LOGIN_SCOPES } from "@/lib/twitter/scopes";
import { verifyTwitterCredentials } from "@/lib/twitter/oauth-server";

export { getAppUrl, getTwitterCallbackUrl } from "@/lib/twitter/env";

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

export async function getTwitterConfigStatus() {
  const oauthConfigured = isTwitterOAuthConfigured();
  const questsConfigured = isTwitterQuestsConfigured();
  const devFallback = allowTwitterDevAuth();
  const callbackUrl = getTwitterCallbackUrl();
  const legacyCallback = process.env.TWITTER_CALLBACK_URL?.trim() || null;
  const callbackMismatch =
    legacyCallback !== null && legacyCallback !== callbackUrl;
  const credentials = oauthConfigured ? await verifyTwitterCredentials() : { ok: false };

  return {
    configured: oauthConfigured,
    devFallback,
    questsConfigured,
    ready: oauthConfigured && !devFallback && credentials.ok,
    missing: getMissingTwitterConfig(),
    callbackUrl,
    appUrl: getAppUrl(),
    loginScopes: TWITTER_LOGIN_SCOPES,
    xPortalCallbackUrl: callbackUrl,
    xPortalCallbacks: [callbackUrl, PRODUCTION_CALLBACK_NO_WWW],
    xPortalWebsiteUrl: getAppUrl(),
    callbackMismatch,
    credentialsValid: credentials.ok,
    ...(credentials.ok
      ? {}
      : {
          credentialsError: credentials.error,
          credentialsHint:
            credentials.status === 401 || credentials.status === 403
              ? "Client ID/Secret invalid — regenerate in developer.x.com and update Vercel env vars"
              : "Check OAuth 2.0 is enabled under User authentication settings",
        }),
    ...(callbackMismatch
      ? {
          hint: `TWITTER_CALLBACK_URL (${legacyCallback}) does not match NEXT_PUBLIC_APP_URL. Register ${callbackUrl} in the X developer portal.`,
        }
      : {}),
    xPortalChecklist: [
      "User authentication → OAuth 2.0 enabled",
      "App type: Web App, Automated App or Bot",
      "App permissions: Read",
      `Website URL: ${getAppUrl()}`,
      `Callback URLs (add both): ${callbackUrl} AND ${PRODUCTION_CALLBACK_NO_WWW}`,
      `Login scopes (minimal): ${TWITTER_LOGIN_SCOPES}`,
    ],
    productionCallbackExample: PRODUCTION_CALLBACK,
  };
}
