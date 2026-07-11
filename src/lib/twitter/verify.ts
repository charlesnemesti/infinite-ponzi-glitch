import {
  OFFICIAL_X_FOLLOW_URL,
  OFFICIAL_X_HANDLE,
  OFFICIAL_X_URL,
  OFFICIAL_X_USER_ID,
  xMention,
} from "@/lib/social/config";
import { getAppAccessToken } from "@/lib/twitter/oauth-server";

const OFFICIAL_X_USER = process.env.TWITTER_OFFICIAL_USER_ID ?? OFFICIAL_X_USER_ID;
const LAUNCH_TWEET_ID = process.env.TWITTER_LAUNCH_TWEET_ID ?? "";

export type VerifyResult = { ok: boolean; unauthorized?: boolean; reason?: string };

export type FollowVerifyOptions = { followIntentAt?: number };

const PAID_TIER_BLOCKED = new Set([402, 403]);
const FOLLOW_INTENT_MIN_MS = 10_000;
const FOLLOW_INTENT_MAX_MS = 30 * 60_000;

function followHonorEnabled(): boolean {
  return process.env.TWITTER_FOLLOW_HONOR_VERIFY !== "false";
}

function verifyFollowHonor(followIntentAt?: number): VerifyResult {
  if (!followHonorEnabled()) {
    return {
      ok: false,
      reason: "follow verify needs X API Basic ($200/mo) — set TWITTER_FOLLOW_HONOR_VERIFY=true for free tier",
    };
  }

  if (!followIntentAt) {
    return {
      ok: false,
      reason: "click OPEN X, follow @Infinite_Ponzi, wait 10s, then EXEC",
    };
  }

  const age = Date.now() - followIntentAt;
  if (age < FOLLOW_INTENT_MIN_MS) {
    return { ok: false, reason: "wait 10s after opening X, then retry EXEC" };
  }
  if (age > FOLLOW_INTENT_MAX_MS) {
    return { ok: false, reason: "click OPEN X again, follow @Infinite_Ponzi, then EXEC" };
  }

  return { ok: true };
}

async function fetchUserTimeline(
  accessToken: string,
  userTwitterId: string,
): Promise<{ ok: true; tweets: unknown[] } | VerifyResult> {
  const timelineUrl = new URL(`https://api.twitter.com/2/users/${userTwitterId}/tweets`);
  timelineUrl.searchParams.set("max_results", "100");
  timelineUrl.searchParams.set("tweet.fields", "referenced_tweets,text");

  const res = await fetch(timelineUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) return { ok: false, unauthorized: true };
  if (!res.ok) return { ok: false, reason: `timeline lookup failed (${res.status})` };

  const data = await res.json();
  return { ok: true, tweets: data.data ?? [] };
}

async function userEngagedWithOfficial(
  accessToken: string,
  userTwitterId: string,
): Promise<VerifyResult> {
  const timeline = await fetchUserTimeline(accessToken, userTwitterId);
  if (!("tweets" in timeline)) return timeline;

  const mention = `@${OFFICIAL_X_HANDLE.toLowerCase()}`;
  const ok = timeline.tweets.some((raw) => {
    const t = raw as {
      text?: string;
      referenced_tweets?: { type: string; id: string }[];
    };
    if (t.text?.toLowerCase().includes(mention)) return true;
    return t.referenced_tweets?.some(
      (r) =>
        (r.type === "retweeted" && r.id === LAUNCH_TWEET_ID) ||
        (r.type === "replied_to" && r.id === LAUNCH_TWEET_ID),
    );
  });

  return {
    ok,
    reason: ok ? undefined : `follow @${OFFICIAL_X_HANDLE} first`,
  };
}

async function lookupUsername(token: string): Promise<string | null> {
  const res = await fetch(
    `https://api.twitter.com/2/users/by/username/${OFFICIAL_X_HANDLE}?user.fields=id`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.id ?? null;
}

async function lookupFromLaunchTweet(token: string): Promise<string | null> {
  if (!LAUNCH_TWEET_ID) return null;

  const res = await fetch(
    `https://api.twitter.com/2/tweets/${LAUNCH_TWEET_ID}?tweet.fields=author_id`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.author_id ?? null;
}

async function resolveOfficialUserId(userAccessToken?: string): Promise<string | null> {
  if (OFFICIAL_X_USER) return OFFICIAL_X_USER;

  // User token + tweet.read can read public launch tweet author (works on free tier)
  if (userAccessToken) {
    const fromTweet = await lookupFromLaunchTweet(userAccessToken);
    if (fromTweet) return fromTweet;
    const fromUsername = await lookupUsername(userAccessToken);
    if (fromUsername) return fromUsername;
  }

  const appToken = await getAppAccessToken();
  if (appToken) {
    const fromUsername = await lookupUsername(appToken);
    if (fromUsername) return fromUsername;
    const fromTweet = await lookupFromLaunchTweet(appToken);
    if (fromTweet) return fromTweet;
  }

  return null;
}

export async function verifyFollowsOfficial(
  accessToken: string,
  userTwitterId: string,
  options?: FollowVerifyOptions,
): Promise<VerifyResult> {
  const officialId = await resolveOfficialUserId(accessToken);

  if (!officialId) {
    return {
      ok: process.env.NODE_ENV === "development",
      reason:
        process.env.NODE_ENV === "development"
          ? undefined
          : "could not resolve @Infinite_Ponzi — set TWITTER_OFFICIAL_USER_ID in env",
    };
  }

  const url = `https://api.twitter.com/2/users/${userTwitterId}/following?max_results=1000`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) return { ok: false, unauthorized: true };

  if (res.ok) {
    const data = await res.json();
    const ids = (data.data ?? []).map((u: { id: string }) => u.id);
    return {
      ok: ids.includes(officialId),
      reason: ids.includes(officialId) ? undefined : `follow @${OFFICIAL_X_HANDLE} first`,
    };
  }

  // X free tier returns 402/403 for follows lookup — use engagement or honor verify
  if (PAID_TIER_BLOCKED.has(res.status)) {
    const engagement = await userEngagedWithOfficial(accessToken, userTwitterId);
    if (engagement.ok || engagement.unauthorized) return engagement;
    return verifyFollowHonor(options?.followIntentAt);
  }

  return { ok: false, reason: `following lookup failed (${res.status})` };
}

async function userRetweetedFromTimeline(
  accessToken: string,
  userTwitterId: string,
): Promise<VerifyResult> {
  const timeline = await fetchUserTimeline(accessToken, userTwitterId);
  if (!("tweets" in timeline)) return timeline;

  const ok = timeline.tweets.some((raw) => {
    const t = raw as { referenced_tweets?: { type: string; id: string }[] };
    return t.referenced_tweets?.some(
      (r) => r.type === "retweeted" && r.id === LAUNCH_TWEET_ID,
    );
  });

  return {
    ok,
    reason: ok ? undefined : "RT the pinned launch tweet (not quote), wait 30s, retry",
  };
}

export async function verifyRetweetedLaunch(
  accessToken: string,
  userTwitterId: string,
): Promise<VerifyResult> {
  if (!LAUNCH_TWEET_ID) {
    return { ok: process.env.NODE_ENV === "development" };
  }

  const timeline = await userRetweetedFromTimeline(accessToken, userTwitterId);
  if (timeline.ok || timeline.unauthorized) return timeline;

  const appToken = await getAppAccessToken();
  const lookupToken = appToken ?? accessToken;
  const tweetUrl = `https://api.twitter.com/2/tweets/${LAUNCH_TWEET_ID}/retweeted_by?max_results=1000`;
  const res = await fetch(tweetUrl, {
    headers: { Authorization: `Bearer ${lookupToken}` },
  });

  if (res.status === 401) return { ok: false, unauthorized: true };

  if (res.ok) {
    const data = await res.json();
    const ok = (data.data ?? []).some((u: { id: string }) => u.id === userTwitterId);
    return {
      ok,
      reason: ok ? undefined : "RT the pinned launch tweet (not quote), wait 30s, retry",
    };
  }

  return timeline;
}

export { OFFICIAL_X_URL, OFFICIAL_X_FOLLOW_URL, OFFICIAL_X_HANDLE, xMention };
