import { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";
import { getAppUrl } from "@/lib/auth/session";
import { BRAND_SLUG } from "@/lib/brand/config";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const username = searchParams.get("username") ?? "NODE";
  const score = searchParams.get("score") ?? "0";
  const rank = searchParams.get("rank") ?? "?";
  const total = searchParams.get("total") ?? "271";
  const ref = searchParams.get("ref") ?? "";

  const appUrl = getAppUrl();
  const refUrl = ref ? `${appUrl}?ref=${ref}` : appUrl;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#030303",
          border: "2px solid #00ff41",
          padding: 40,
          fontFamily: "monospace",
        }}
      >
        <div style={{ color: "#00ff4180", fontSize: 14, letterSpacing: 4 }}>
          {BRAND_SLUG}
        </div>
        <div style={{ color: "#00ff41", fontSize: 36, fontWeight: 700, marginTop: 20 }}>
          @{username}
        </div>
        <div style={{ color: "#00f0ff", fontSize: 56, fontWeight: 700, marginTop: 16 }}>
          {Number(score).toLocaleString()} XP
        </div>
        <div style={{ color: "#ff0080", fontSize: 24, marginTop: 12 }}>
          RANK #{rank} / {total}
        </div>
        <div style={{ color: "#00ff41", fontSize: 18, marginTop: 32 }}>
          {">"} CAN YOU BEAT ME?
        </div>
        <div style={{ color: "#00ff4180", fontSize: 12, marginTop: 12 }}>{refUrl}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
