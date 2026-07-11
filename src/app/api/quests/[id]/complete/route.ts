import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  ACCESS_TOKEN_COOKIE,
  forceRefreshAccessToken,
  getTwitterSession,
  getValidAccessTokenWithRefresh,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/session";
import { verifyFollowsOfficial, verifyRetweetedLaunch, type VerifyResult } from "@/lib/twitter/verify";
import { isTwitterQuestsConfigured } from "@/lib/twitter/config";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

async function resolveAccessToken(forceRefresh = false): Promise<string | null> {
  if (forceRefresh) {
    const newTokens = await forceRefreshAccessToken();
    if (newTokens) {
      const cookieStore = await cookies();
      cookieStore.set(ACCESS_TOKEN_COOKIE, newTokens.access_token, cookieOptions(60 * 60 * 24 * 30));
      if (newTokens.refresh_token) {
        cookieStore.set(
          REFRESH_TOKEN_COOKIE,
          newTokens.refresh_token,
          cookieOptions(60 * 60 * 24 * 60),
        );
      }
      return newTokens.access_token;
    }
    return null;
  }

  const { accessToken, refreshed, newTokens } = await getValidAccessTokenWithRefresh();

  if (refreshed && newTokens) {
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_TOKEN_COOKIE, newTokens.access_token, cookieOptions(60 * 60 * 24 * 30));
    if (newTokens.refresh_token) {
      cookieStore.set(
        REFRESH_TOKEN_COOKIE,
        newTokens.refresh_token,
        cookieOptions(60 * 60 * 24 * 60),
      );
    }
  }

  return accessToken;
}

async function verifyWithRetry(
  verifyFn: (token: string) => Promise<VerifyResult>,
): Promise<VerifyResult> {
  let token = await resolveAccessToken();
  if (!token) return { ok: false, reason: "no X access token" };

  let result = await verifyFn(token);
  if (result.unauthorized) {
    token = await resolveAccessToken(true);
    if (!token) return { ok: false, unauthorized: true, reason: "X session expired" };
    result = await verifyFn(token);
  }

  return result;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: questId } = await params;
  const body = await request.json();
  const wallet = body.wallet as string | undefined;

  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  const user = await db.getUserByWallet(wallet);
  if (!user) {
    return NextResponse.json({ error: "sync user first" }, { status: 400 });
  }

  const completed = await db.getQuestCompletions(user.id);
  if (completed.includes(questId)) {
    return NextResponse.json({ success: true, already: true, completedQuests: completed });
  }

  const twitter = await getTwitterSession();

  switch (questId) {
    case "connect-wallet":
      await db.completeQuest(user.id, questId);
      break;

    case "connect-x":
      if (!twitter.connected) {
        return NextResponse.json({ error: "connect X first" }, { status: 400 });
      }
      await db.completeQuest(user.id, questId);
      break;

    case "follow-project":
      if (!twitter.connected || !user.twitter_id) {
        return NextResponse.json({ error: "connect X first" }, { status: 400 });
      }
      if (!isTwitterQuestsConfigured()) {
        if (process.env.NODE_ENV !== "development") {
          return NextResponse.json({ error: "quest verification not configured" }, { status: 503 });
        }
      } else {
        const result = await verifyWithRetry((token) =>
          verifyFollowsOfficial(token, user.twitter_id!),
        );
        if (!result.ok) {
          if (result.unauthorized) {
            return NextResponse.json({ error: "X session expired — reconnect X" }, { status: 401 });
          }
          return NextResponse.json(
            { error: result.reason ?? "follow not verified" },
            { status: 400 },
          );
        }
      }
      await db.completeQuest(user.id, questId);
      break;

    case "retweet-launch":
      if (!twitter.connected || !user.twitter_id) {
        return NextResponse.json({ error: "connect X first" }, { status: 400 });
      }
      if (!isTwitterQuestsConfigured()) {
        if (process.env.NODE_ENV !== "development") {
          return NextResponse.json({ error: "quest verification not configured" }, { status: 503 });
        }
      } else {
        const result = await verifyWithRetry((token) =>
          verifyRetweetedLaunch(token, user.twitter_id!),
        );
        if (!result.ok) {
          if (result.unauthorized) {
            return NextResponse.json({ error: "X session expired — reconnect X" }, { status: 401 });
          }
          return NextResponse.json(
            { error: result.reason ?? "retweet not verified" },
            { status: 400 },
          );
        }
      }
      await db.completeQuest(user.id, questId);
      break;

    case "invite-friend":
      return NextResponse.json({ error: "complete via referral system" }, { status: 400 });

    default:
      if (process.env.NODE_ENV === "development") {
        await db.completeQuest(user.id, questId);
      } else {
        return NextResponse.json({ error: "quest not available" }, { status: 400 });
      }
  }

  await db.creditReferral(user.id);
  const completedQuests = await db.getQuestCompletions(user.id);
  const updated = await db.getUserByWallet(wallet);

  return NextResponse.json({
    success: true,
    completedQuests,
    score: updated?.attention_score ?? 0,
  });
}
