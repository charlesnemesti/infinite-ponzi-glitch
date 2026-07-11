import { NextResponse } from "next/server";
import { allowTwitterDevAuth } from "@/lib/twitter/config";

const SESSION_COOKIE = "twitter_session";
const TOKEN_COOKIE = "twitter_access_token";

export async function GET() {
  if (!allowTwitterDevAuth()) {
    return NextResponse.json({ error: "Dev auth disabled" }, { status: 403 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = {
    connected: true,
    username: "dev_glitch_user",
    name: "Dev Glitch User",
    profileImageUrl: null,
    twitter_id: "dev_twitter_0001",
    score: 42069,
  };

  const response = NextResponse.redirect(`${baseUrl}/?twitter=connected&dev=1`);

  response.cookies.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  response.cookies.set(TOKEN_COOKIE, "dev_access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
