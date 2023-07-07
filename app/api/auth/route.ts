import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { getEventFromRequest } from "#/utils/getEventFromRequest";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const event = getEventFromRequest(request);

  const res = await kv.zadd("users", {
    score: Date.now(),
    member: event.pubkey,
  });

  const isNewUser = typeof res === "number" && res > 0;

  return new NextResponse(
    JSON.stringify({
      message: isNewUser ? "Hello, world!" : "Welcome back",
      isNewUser,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
