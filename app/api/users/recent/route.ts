import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest) {
  const users = await kv.zrange("users", "+inf", "-inf", {
    rev: true,
    count: 5,
    offset: 0,
    byScore: true,
  });
  return NextResponse.json({ users }, { status: 200 });
}
