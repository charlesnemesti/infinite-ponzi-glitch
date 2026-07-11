import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { allowTwitterDevAuth } from "@/lib/twitter/config";
import {
  ACCESS_TOKEN_COOKIE,
  LINK_WALLET_COOKIE,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import { LinkConflictError, linkWalletAccount } from "@/lib/user/link-account";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

export async function GET() {
  if (!allowTwitterDevAuth()) {
    return NextResponse.json({ error: "Dev auth disabled" }, { status: 403 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cookieStore = await cookies();
  const pendingWallet = cookieStore.get(LINK_WALLET_COOKIE)?.value;

  const session = {
    connected: true,
    username: "dev_glitch_user",
    name: "Dev Glitch User",
    profileImageUrl: null,
    twitter_id: "dev_twitter_0001",
    score: 42069,
  };

  let redirectUrl = `${baseUrl}/?twitter=connected&dev=1`;

  if (pendingWallet && /^0x[a-fA-F0-9]{40}$/.test(pendingWallet)) {
    try {
      await linkWalletAccount(pendingWallet, {
        twitter: {
          twitter_id: session.twitter_id,
          twitter_username: session.username,
          twitter_name: session.name,
          profile_image_url: undefined,
        },
      });
      redirectUrl = `${baseUrl}/?twitter=connected&dev=1&linked=1`;
    } catch (e) {
      if (e instanceof LinkConflictError) {
        redirectUrl = `${baseUrl}/?twitter=conflict&dev=1`;
      }
    }
  }

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(SESSION_COOKIE, JSON.stringify(session), cookieOptions(60 * 60 * 24 * 30));
  response.cookies.set(ACCESS_TOKEN_COOKIE, "dev_access_token", cookieOptions(60 * 60 * 24 * 30));
  response.cookies.delete(LINK_WALLET_COOKIE);

  return response;
}
