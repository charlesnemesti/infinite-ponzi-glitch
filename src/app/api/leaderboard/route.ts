import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const entries = await db.getLeaderboard(50);
  const total = entries.length;
  return NextResponse.json({ entries, total, synced_at: new Date().toISOString() });
}
