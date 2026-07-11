import { NextRequest, NextResponse } from "next/server";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  getTwitterAuthUrl,
} from "@/lib/twitter/oauth-server";
import { allowTwitterDevAuth, isTwitterOAuthConfigured } from "@/lib/twitter/config";
import { LINK_WALLET_COOKIE } from "@/lib/auth/session";

const STATE_COOKIE = "twitter_oauth_state";
const VERIFIER_COOKIE = "twitter_code_verifier";

function isValidWallet(wallet: string | null) {
  return Boolean(wallet && /^0x[a-fA-F0-9]{40}$/.test(wallet));
}

function attachWalletCookie(response: NextResponse, wallet: string | null) {
  if (isValidWallet(wallet)) {
    response.cookies.set(LINK_WALLET_COOKIE, wallet!.toLowerCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
  }
  return response;
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const wallet = request.nextUrl.searchParams.get("wallet");

  if (!isTwitterOAuthConfigured()) {
    if (allowTwitterDevAuth()) {
      return attachWalletCookie(
        NextResponse.redirect(`${baseUrl}/api/auth/twitter/dev`),
        wallet,
      );
    }
    return attachWalletCookie(
      NextResponse.redirect(`${baseUrl}/?twitter=not_configured`),
      wallet,
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

    return attachWalletCookie(response, wallet);
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth init failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
