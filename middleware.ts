import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateEvent } from "nostr-tools";
import { validateNIP98Event } from "./utils/validateNIP98Event";
import {
  authorizationRequiredError,
  getEventFromRequest,
} from "./utils/getEventFromRequest";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  try {
    const event = getEventFromRequest(request);

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

    return NextResponse.next();
  } catch (e) {
    if ((e as Error).message === authorizationRequiredError.message) {
      return NextResponse.json({
        message: "Authorization header is required.",
      });
    }
    return NextResponse.json({ message: "Failed to decode" }, { status: 401 });
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/api/auth", "/api/my-data"],
};
