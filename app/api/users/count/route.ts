import { USERS_COUNT_KEY } from "#/constants/kv";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest) {
  const usersCount = await kv.zcount("users", "-inf", "+inf");
  if (typeof usersCount !== "number") {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
  return NextResponse.json({ count: usersCount }, { status: 200 });
}
