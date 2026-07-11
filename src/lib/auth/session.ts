import { cookies } from "next/headers";
import type { TwitterSession } from "@/types";
import { refreshTwitterToken } from "@/lib/twitter/oauth-server";
import { isTwitterOAuthConfigured } from "@/lib/twitter/config";

const SESSION_COOKIE = "twitter_session";
const ACCESS_TOKEN_COOKIE = "twitter_access_token";
const REFRESH_TOKEN_COOKIE = "twitter_refresh_token";
const REF_COOKIE = "ipg_ref";

export async function getTwitterSession(): Promise<TwitterSession & { twitter_id?: string }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return { connected: false };
  try {
    return JSON.parse(raw) as TwitterSession & { twitter_id?: string };
  } catch {
    return { connected: false };
  }
}

export async function getReferralCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REF_COOKIE)?.value ?? null;
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/** Returns a valid access token, refreshing via refresh_token if needed. */
export async function getValidAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken && accessToken !== "dev_access_token") {
    return accessToken;
  }

  if (!refreshToken || !isTwitterOAuthConfigured()) {
    return accessToken ?? null;
  }

  try {
    const tokens = await refreshTwitterToken(refreshToken);
    // Note: cookies can only be set in Route Handlers; caller must persist if needed
    return tokens.access_token;
  } catch {
    return null;
  }
}

/** Force refresh using refresh_token cookie. Returns new tokens or null. */
export async function forceRefreshAccessToken(): Promise<{
  access_token: string;
  refresh_token?: string;
} | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken || !isTwitterOAuthConfigured()) return null;

  try {
    return await refreshTwitterToken(refreshToken);
  } catch {
    return null;
  }
}

export async function getValidAccessTokenWithRefresh(): Promise<{
  accessToken: string | null;
  refreshed: boolean;
  newTokens?: { access_token: string; refresh_token?: string };
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken && accessToken !== "dev_access_token") {
    return { accessToken, refreshed: false };
  }

  if (!refreshToken || !isTwitterOAuthConfigured()) {
    return { accessToken: accessToken ?? null, refreshed: false };
  }

  try {
    const tokens = await refreshTwitterToken(refreshToken);
    return {
      accessToken: tokens.access_token,
      refreshed: true,
      newTokens: tokens,
    };
  } catch {
    return { accessToken: null, refreshed: false };
  }
}

export const LINK_WALLET_COOKIE = "ipg_link_wallet";

export {
  SESSION_COOKIE,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
};
