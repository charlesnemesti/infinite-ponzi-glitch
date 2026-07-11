import { randomBytes, createHash } from "crypto";

const TWITTER_AUTH_URL = "https://twitter.com/i/oauth2/authorize";
const TWITTER_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";

let cachedAppToken: { token: string; expiresAt: number } | null = null;

/** App-only token for server-side lookups (username → id, tweet author, etc.) */
export async function getAppAccessToken(): Promise<string | null> {
  if (cachedAppToken && cachedAppToken.expiresAt > Date.now()) {
    return cachedAppToken.token;
  }

  const clientId = process.env.TWITTER_CLIENT_ID?.trim();
  const clientSecret = process.env.TWITTER_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(TWITTER_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "tweet.read users.read follows.read",
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { access_token: string; expires_in?: number };
  cachedAppToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 7200) * 1000 - 60_000,
  };
  return data.access_token;
}

export const TWITTER_SCOPES = [
  "tweet.read",
  "users.read",
  "follows.read",
  "offline.access",
].join(" ");

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  return base64UrlEncode(randomBytes(32));
}

export function generateCodeChallenge(verifier: string): string {
  return base64UrlEncode(createHash("sha256").update(verifier).digest());
}

export function getTwitterAuthUrl(state: string, codeChallenge: string): string {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const redirectUri = process.env.TWITTER_CALLBACK_URL;

  if (!clientId || !redirectUri) {
    throw new Error("Missing Twitter OAuth environment variables");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: TWITTER_SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${TWITTER_AUTH_URL}?${params.toString()}`;
}

export async function exchangeTwitterCode(
  code: string,
  codeVerifier: string,
): Promise<{ access_token: string; refresh_token?: string }> {
  const clientId = process.env.TWITTER_CLIENT_ID!;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET!;
  const redirectUri = process.env.TWITTER_CALLBACK_URL!;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(TWITTER_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter token exchange failed: ${error}`);
  }

  return response.json();
}

export async function fetchTwitterUser(accessToken: string) {
  const response = await fetch(
    "https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics,username,name",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter user fetch failed: ${error}`);
  }

  return response.json();
}

export async function refreshTwitterToken(
  refreshToken: string,
): Promise<{ access_token: string; refresh_token?: string }> {
  const clientId = process.env.TWITTER_CLIENT_ID!;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET!;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const response = await fetch(TWITTER_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter token refresh failed: ${error}`);
  }

  return response.json();
}

export function calculateAttentionScore(metrics: {
  followers_count?: number;
  tweet_count?: number;
  listed_count?: number;
}): number {
  const followers = metrics.followers_count ?? 0;
  const tweets = metrics.tweet_count ?? 0;
  const listed = metrics.listed_count ?? 0;

  return Math.round(followers * 2 + tweets * 5 + listed * 10);
}
