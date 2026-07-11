import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  await db.ensureDefaultFlashEvent();
  const event = await db.getActiveFlashEvent();
  if (!event) {
    return NextResponse.json({ active: false });
  }

  const ends = new Date(event.ends_at).getTime();
  const remaining = Math.max(0, ends - Date.now());

  return NextResponse.json({
    active: true,
    multiplier: event.multiplier,
    ends_at: event.ends_at,
    remaining_ms: remaining,
  });
}
