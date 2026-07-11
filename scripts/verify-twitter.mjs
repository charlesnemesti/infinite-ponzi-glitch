#!/usr/bin/env node
/**
 * Verifies Twitter/X OAuth env configuration.
 * Usage: npm run verify:twitter
 * Loads .env.local if present (Next.js convention).
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
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

function check(name) {
  const val = process.env[name]?.trim();
  return { name, ok: Boolean(val), value: val ? `${val.slice(0, 8)}...` : "(empty)" };
}

const oauthVars = ["TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET", "TWITTER_CALLBACK_URL"];
const questVars = ["TWITTER_OFFICIAL_USER_ID", "TWITTER_LAUNCH_TWEET_ID"];
const otherVars = ["NEXT_PUBLIC_APP_URL", "ALLOW_TWITTER_DEV"];

console.log("\n=== Twitter/X OAuth Config Check ===\n");

for (const name of [...oauthVars, ...questVars, ...otherVars]) {
  const { ok, value } = check(name);
  console.log(`${ok ? "✓" : "✗"} ${name}: ${ok ? "set" : value}`);
}

const oauthOk = oauthVars.every((n) => process.env[n]?.trim());
const questsOk = questVars.every((n) => process.env[n]?.trim());
const devAllowed =
  process.env.ALLOW_TWITTER_DEV !== "false" &&
  (process.env.ALLOW_TWITTER_DEV === "true" || process.env.NODE_ENV === "development");
const devFallback = !oauthOk && devAllowed;

console.log("\n--- Summary ---");
console.log(`OAuth configured:  ${oauthOk ? "YES" : "NO"}`);
console.log(`Quests configured: ${questsOk ? "YES" : "NO"}`);
console.log(`Dev mock fallback: ${devFallback ? "YES (CONNECT_X uses mock)" : "NO (real OAuth)"}`);
console.log(`Production ready:  ${oauthOk && !devFallback ? "YES" : "NO"}`);

if (!oauthOk) {
  console.log("\n→ Fill TWITTER_CLIENT_ID, SECRET, CALLBACK_URL from developer.x.com");
  console.log("→ See docs/TWITTER_SETUP.md");
}

if (oauthOk && !questsOk) {
  console.log("\n→ OAuth works but follow/retweet quests need OFFICIAL_USER_ID + LAUNCH_TWEET_ID");
}

console.log("");
process.exit(oauthOk && !devFallback ? 0 : 1);
