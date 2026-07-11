import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getReferralCookie, getTwitterSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const wallet = body.wallet as string | undefined;
    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    const twitter = await getTwitterSession();
    const refCode = body.refCode ?? (await getReferralCookie());

    const user = await db.upsertUser({
      wallet,
      twitter_id: twitter.twitter_id,
      twitter_username: twitter.username,
      twitter_name: twitter.name,
      profile_image_url: twitter.profileImageUrl,
      referred_by_code: refCode ?? undefined,
    });

    if (twitter.connected) {
      const completed = await db.getQuestCompletions(user.id);
      if (!completed.includes("connect-x")) {
        await db.completeQuest(user.id, "connect-x");
      }
    }

    const walletDone = (await db.getQuestCompletions(user.id)).includes("connect-wallet");
    if (!walletDone) {
      await db.completeQuest(user.id, "connect-wallet");
    }

    await db.creditReferral(user.id);

    const rank = await db.getUserRank(user.id);
    const completedQuests = await db.getQuestCompletions(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        wallet: user.wallet_address,
        username: user.twitter_username,
        referral_code: user.referral_code,
        score: user.attention_score,
        rank,
        squad_id: user.squad_id,
      },
      completedQuests,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  const user = await db.getUserByWallet(wallet);
  if (!user) {
    return NextResponse.json({ user: null, completedQuests: [] });
  }

  const rank = await db.getUserRank(user.id);
  const completedQuests = await db.getQuestCompletions(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      wallet: user.wallet_address,
      username: user.twitter_username,
      referral_code: user.referral_code,
      score: user.attention_score,
      rank,
      squad_id: user.squad_id,
    },
    completedQuests,
  });
}
