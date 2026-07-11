import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const wallet = body.wallet as string;
  const inviteCode = body.invite_code as string;

  if (!wallet || !inviteCode) {
    return NextResponse.json({ error: "wallet and invite_code required" }, { status: 400 });
  }

  const user = await db.getUserByWallet(wallet);
  if (!user) {
    return NextResponse.json({ error: "sync user first" }, { status: 400 });
  }

  const squad = await db.joinSquad(user.id, inviteCode);
  if (!squad) {
    return NextResponse.json({ error: "invalid code or squad full" }, { status: 400 });
  }

  return NextResponse.json({ squad });
}
