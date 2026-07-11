const OFFICIAL_X_USER = process.env.TWITTER_OFFICIAL_USER_ID ?? "";
const LAUNCH_TWEET_ID = process.env.TWITTER_LAUNCH_TWEET_ID ?? "";

export type VerifyResult = { ok: boolean; unauthorized?: boolean };

export async function verifyFollowsOfficial(
  accessToken: string,
  userTwitterId: string,
): Promise<VerifyResult> {
  if (!OFFICIAL_X_USER) {
    return { ok: process.env.NODE_ENV === "development" };
  }

  const url = `https://api.twitter.com/2/users/${userTwitterId}/following?max_results=1000`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) return { ok: false, unauthorized: true };
  if (!res.ok) return { ok: false };

  const data = await res.json();
  const ids = (data.data ?? []).map((u: { id: string }) => u.id);
  return { ok: ids.includes(OFFICIAL_X_USER) };
}

export async function verifyRetweetedLaunch(
  accessToken: string,
  userTwitterId: string,
): Promise<VerifyResult> {
  if (!LAUNCH_TWEET_ID) {
    return { ok: process.env.NODE_ENV === "development" };
  }

  const tweetUrl = `https://api.twitter.com/2/tweets/${LAUNCH_TWEET_ID}/retweeted_by?max_results=1000`;
  const res = await fetch(tweetUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) return { ok: false, unauthorized: true };

  if (!res.ok) {
    const timelineUrl = `https://api.twitter.com/2/users/${userTwitterId}/tweets?max_results=20&tweet.fields=referenced_tweets`;
    const tlRes = await fetch(timelineUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (tlRes.status === 401) return { ok: false, unauthorized: true };
    if (!tlRes.ok) return { ok: false };
    const tl = await tlRes.json();
    const ok = (tl.data ?? []).some(
      (t: { referenced_tweets?: { type: string; id: string }[] }) =>
        t.referenced_tweets?.some(
          (r) => r.type === "retweeted" && r.id === LAUNCH_TWEET_ID,
        ),
    );
    return { ok };
  }

  const data = await res.json();
  const ok = (data.data ?? []).some((u: { id: string }) => u.id === userTwitterId);
  return { ok };
}
