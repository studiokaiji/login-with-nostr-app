import { NextRequest } from "next/server";
import { Event } from "nostr-tools";

export const authorizationRequiredError = Error("Authorization is required");

export function getEventFromRequest(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization) {
    throw authorizationRequiredError;
  }

  const token = authorization.substring(5);
  const decoded = Buffer.from(token, "base64").toString();

  const event = JSON.parse(decoded) as Event;

  return event;
}
