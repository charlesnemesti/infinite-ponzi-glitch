import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  calculateAttentionScore,
  exchangeTwitterCode,
  fetchTwitterUser,
} from "@/lib/twitter/oauth-server";
import {
  ACCESS_TOKEN_COOKIE,
  LINK_WALLET_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import { LinkConflictError, linkWalletAccount } from "@/lib/user/link-account";

const STATE_COOKIE = "twitter_oauth_state";
const VERIFIER_COOKIE = "twitter_code_verifier";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?twitter=error&detail=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/?twitter=missing`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get(STATE_COOKIE)?.value;
  const codeVerifier = cookieStore.get(VERIFIER_COOKIE)?.value;
  const pendingWallet = cookieStore.get(LINK_WALLET_COOKIE)?.value;

  if (!savedState || savedState !== state || !codeVerifier) {
    return NextResponse.redirect(`${baseUrl}/?twitter=invalid_state`);
  }

  try {
    const tokens = await exchangeTwitterCode(code, codeVerifier);
    const userResponse = await fetchTwitterUser(tokens.access_token);
    const user = userResponse.data;

    const session = {
      connected: true,
      username: user.username,
      name: user.name,
      profileImageUrl: user.profile_image_url,
      twitter_id: user.id,
      score: calculateAttentionScore(user.public_metrics ?? {}),
    };

    let redirectUrl = `${baseUrl}/?twitter=connected`;

    if (pendingWallet && /^0x[a-fA-F0-9]{40}$/.test(pendingWallet)) {
      try {
        await linkWalletAccount(pendingWallet, {
          twitter: {
            twitter_id: user.id,
            twitter_username: user.username,
            twitter_name: user.name,
            profile_image_url: user.profile_image_url,
          },
        });
        redirectUrl = `${baseUrl}/?twitter=connected&linked=1`;
      } catch (e) {
        if (e instanceof LinkConflictError) {
          redirectUrl = `${baseUrl}/?twitter=conflict`;
        } else {
          console.error("[twitter/callback] link failed", e);
        }
      }
    }

    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set(SESSION_COOKIE, JSON.stringify(session), cookieOptions(60 * 60 * 24 * 30));
    response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, cookieOptions(60 * 60 * 24 * 30));

    if (tokens.refresh_token) {
      response.cookies.set(
        REFRESH_TOKEN_COOKIE,
        tokens.refresh_token,
        cookieOptions(60 * 60 * 24 * 60),
      );
    }

    response.cookies.delete(STATE_COOKIE);
    response.cookies.delete(VERIFIER_COOKIE);
    response.cookies.delete(LINK_WALLET_COOKIE);

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[twitter/callback]", message);
    const detail =
      process.env.NODE_ENV === "development"
        ? encodeURIComponent(message.slice(0, 120))
        : "";
    return NextResponse.redirect(
      `${baseUrl}/?twitter=failed${detail ? `&detail=${detail}` : ""}`,
    );
  }
}
