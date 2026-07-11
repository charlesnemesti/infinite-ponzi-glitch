import { NextRequest, NextResponse } from "next/server";

const REF_COOKIE = "ipg_ref";

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ error: "ref required" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, ref: ref.toUpperCase() });
  response.cookies.set(REF_COOKIE, ref.toUpperCase(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
