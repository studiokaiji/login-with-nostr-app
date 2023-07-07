import { createHash } from "crypto";
import { Event } from "nostr-tools";

export const validateNIP98Event = <T extends boolean = false>(
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
