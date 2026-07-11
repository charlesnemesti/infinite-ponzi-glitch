import { NextResponse } from "next/server";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  getTwitterAuthUrl,
} from "@/lib/twitter/oauth-server";
import { allowTwitterDevAuth, isTwitterOAuthConfigured } from "@/lib/twitter/config";

const STATE_COOKIE = "twitter_oauth_state";
const VERIFIER_COOKIE = "twitter_code_verifier";

export async function GET() {
  if (!isTwitterOAuthConfigured()) {
    if (allowTwitterDevAuth()) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      return NextResponse.redirect(`${baseUrl}/api/auth/twitter/dev`);
    }
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/?twitter=not_configured`,
    );
  }

  try {
    const state = generateCodeVerifier();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const authUrl = getTwitterAuthUrl(state, codeChallenge);

    const response = NextResponse.redirect(authUrl);

    response.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    response.cookies.set(VERIFIER_COOKIE, codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth init failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
