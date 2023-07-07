import { NextRequest, NextResponse } from "next/server";
import { Event, validateEvent } from "nostr-tools";
import { createHash } from "crypto";
import { kv } from "@vercel/kv";

const validateNIP98Event = <T extends boolean = false>(
  event: Event,
  params: {
    method: String;
    url: string;
    validatePayloadHash?: T;
  } & (T extends true ? { payload: unknown } : {})
) => {
  const { method, url, validatePayloadHash } = params;

  // 1. Check if kind is 27235
  if (Number(event.kind) !== 27235) {
    return false;
  }

  // 2. Check if u tag value matches the request URL
  const uTag = event.tags.find((tag) => tag[0] === "u");
  if (!uTag || uTag[1] !== url) {
    return false;
  }

  // 3. Check if method tag value matches the request method
  const methodTag = event.tags.find((tag) => tag[0] === "method");
  if (!methodTag || methodTag[1] !== method) {
    return false;
  }

  // If request has a body, check if payload tag value matches the SHA256 hash of the request body
  if (validatePayloadHash === true && method !== "GET") {
    const payloadTag = event.tags.find((tag) => tag[0] === "payload");

    const correctPayload = (params as { payload: unknown }).payload;
    const correctPayloadHash = createHash("sha256")
      .update(JSON.stringify(correctPayload), "utf8")
      .digest("hex");

    if (!payloadTag || payloadTag[1] !== correctPayloadHash) {
      return false;
    }
  }

  return true;
};

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json(
      { message: "Authorization is required" },
      { status: 401 }
    );
  }

  let event: Event;

  try {
    const token = authorization.substring(5);
    const decoded = Buffer.from(token, "base64").toString();

    event = JSON.parse(decoded) as Event;

    if (!validateEvent(event)) {
      return NextResponse.json(
        { message: "Incorrect Nostr event" },
        { status: 401 }
      );
    }

    if (
      !validateNIP98Event(event, {
        method: request.method,
        url: request.url,
      })
    ) {
      return NextResponse.json(
        { message: "Incorrect NIP-98 event" },
        { status: 401 }
      );
    }
  } catch (e) {
    return NextResponse.json({ message: "Failed to decode" }, { status: 401 });
  }

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
