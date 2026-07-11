import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { TwitterSession } from "@/types";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SESSION_COOKIE,
} from "@/lib/auth/session";

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return NextResponse.json({ connected: false } satisfies TwitterSession);
  }

  try {
    const session = JSON.parse(raw) as TwitterSession;
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ connected: false } satisfies TwitterSession);
  }
}

export async function DELETE() {
  const response = NextResponse.json({ connected: false });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}
