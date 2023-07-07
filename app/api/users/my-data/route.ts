import { getEventFromRequest } from "#/utils/getEventFromRequest";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  const event = getEventFromRequest(request);
  const removed = await kv.zrem("users", event.pubkey);
  if (!removed) {
    return NextResponse.json(null, { status: 500 });
  }
  return NextResponse.json(null, { status: 200 });
}
