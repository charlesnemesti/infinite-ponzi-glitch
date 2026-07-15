import { NextResponse } from "next/server";
import { getTwitterConfigStatus } from "@/lib/twitter/config";

export async function GET() {
  return NextResponse.json(await getTwitterConfigStatus());
}
