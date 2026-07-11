import {
  OFFICIAL_X_FOLLOW_URL,
  OFFICIAL_X_HANDLE,
  OFFICIAL_X_URL,
  xMention,
} from "@/lib/social/config";

const OFFICIAL_X_USER = process.env.TWITTER_OFFICIAL_USER_ID ?? "";
const LAUNCH_TWEET_ID = process.env.TWITTER_LAUNCH_TWEET_ID ?? "";

export type VerifyResult = { ok: boolean; unauthorized?: boolean; reason?: string };

async function resolveOfficialUserId(accessToken: string): Promise<string | null> {
  if (OFFICIAL_X_USER) return OFFICIAL_X_USER;

  const res = await fetch(
    `https://api.twitter.com/2/users/by/username/${OFFICIAL_X_HANDLE}?user.fields=id`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.id ?? null;
}

export async function verifyFollowsOfficial(
  accessToken: string,
  userTwitterId: string,
): Promise<VerifyResult> {
  const officialId = await resolveOfficialUserId(accessToken);

  if (!officialId) {
    return {
      ok: process.env.NODE_ENV === "development",
      reason: process.env.NODE_ENV === "development" ? undefined : "could not resolve official account",
    };
  }

  const url = `https://api.twitter.com/2/users/${userTwitterId}/following?max_results=1000`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) return { ok: false, unauthorized: true };
  if (!res.ok) return { ok: false, reason: `following lookup failed (${res.status})` };

  const data = await res.json();
  const ids = (data.data ?? []).map((u: { id: string }) => u.id);
  return {
    ok: ids.includes(officialId),
    reason: ids.includes(officialId) ? undefined : `follow @${OFFICIAL_X_HANDLE} first`,
  };
}

async function userRetweetedFromTimeline(
  accessToken: string,
  userTwitterId: string,
): Promise<VerifyResult> {
  const timelineUrl = new URL(`https://api.twitter.com/2/users/${userTwitterId}/tweets`);
  timelineUrl.searchParams.set("max_results", "100");
  timelineUrl.searchParams.set("tweet.fields", "referenced_tweets");

  const tlRes = await fetch(timelineUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (tlRes.status === 401) return { ok: false, unauthorized: true };
  if (!tlRes.ok) return { ok: false, reason: `timeline lookup failed (${tlRes.status})` };

  const tl = await tlRes.json();
  const ok = (tl.data ?? []).some(
    (t: { referenced_tweets?: { type: string; id: string }[] }) =>
      t.referenced_tweets?.some(
        (r) => r.type === "retweeted" && r.id === LAUNCH_TWEET_ID,
      ),
  );

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

  const tweetUrl = `https://api.twitter.com/2/tweets/${LAUNCH_TWEET_ID}/retweeted_by?max_results=1000`;
  const res = await fetch(tweetUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
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
