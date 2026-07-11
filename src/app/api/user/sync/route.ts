import { NextRequest, NextResponse } from "next/server";
import { LinkConflictError, linkWalletAccount } from "@/lib/user/link-account";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const wallet = body.wallet as string | undefined;
    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    const result = await linkWalletAccount(wallet, { refCode: body.refCode });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof LinkConflictError) {
      return NextResponse.json(
        { error: "This X account is already linked to another wallet" },
        { status: 409 },
      );
    }
    const message = e instanceof Error ? e.message : "sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  const { db } = await import("@/lib/db");
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
