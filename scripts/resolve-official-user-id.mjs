#!/usr/bin/env node
/**
 * Resolve @InfPonsiGlitch numeric user ID for TWITTER_OFFICIAL_USER_ID.
 * Usage: npm run resolve:official-id
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const clientId = process.env.TWITTER_CLIENT_ID?.trim();
const clientSecret = process.env.TWITTER_CLIENT_SECRET?.trim();
const handle = process.env.NEXT_PUBLIC_OFFICIAL_X_HANDLE?.trim() || "InfPonsiGlitch";

const launchTweetId = process.env.TWITTER_LAUNCH_TWEET_ID?.trim();

if (!clientId || !clientSecret) {
  console.error("Missing TWITTER_CLIENT_ID or TWITTER_CLIENT_SECRET in .env.local");
  process.exit(1);
}

const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
  method: "POST",
  headers: {
    Authorization: `Basic ${basicAuth}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "tweet.read users.read",
  }),
});

const tokenJson = await tokenRes.json();
if (!tokenJson.access_token) {
  console.error("Token error:", tokenJson);
  process.exit(1);
}

const token = tokenJson.access_token;

async function tryLookup(label, url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const text = await res.text();
  console.log(`${label} (${res.status}):`, text);
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const userData = await tryLookup(
  "username",
  `https://api.twitter.com/2/users/by/username/${handle}?user.fields=id`,
);

let userId = userData?.data?.id;

if (!userId && launchTweetId) {
  const tweetData = await tryLookup(
    "tweet",
    `https://api.twitter.com/2/tweets/${launchTweetId}?tweet.fields=author_id`,
  );
  userId = tweetData?.data?.author_id;
}

if (userId) {
  console.log(`\n✓ TWITTER_OFFICIAL_USER_ID=${userId}`);
  console.log(`Add to .env.local and Vercel Production env vars.`);
} else {
  console.error("\n✗ Could not resolve user ID");
  process.exit(1);
}
