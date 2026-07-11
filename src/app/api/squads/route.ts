import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const wallet = body.wallet as string;
  const name = body.name as string;

  if (!wallet || !name) {
    return NextResponse.json({ error: "wallet and name required" }, { status: 400 });
  }

  const user = await db.getUserByWallet(wallet);
  if (!user) {
    return NextResponse.json({ error: "sync user first" }, { status: 400 });
  }

  if (user.squad_id) {
    return NextResponse.json({ error: "already in squad" }, { status: 400 });
  }

  const squad = await db.createSquad(user.id, name.slice(0, 24));
  return NextResponse.json({ squad });
}

export async function GET() {
  const leaderboard = await db.getSquadLeaderboard();
  return NextResponse.json({ squads: leaderboard });
}
