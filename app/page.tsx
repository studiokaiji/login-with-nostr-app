"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { Event, SimplePool } from "nostr-tools";
import { ProfileCard } from "#/components/ProfileCard";

const relays = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.wirednet.jp",
  "wss://relay-jp.nostr.wirednet.jp",
  "wss://nostr-relay.nokotaro.com",
];

export default function Home() {
  return (
    <main className="flex flex-col space-y-7 p-7">
      <p>Maintenance...</p>
    </main>
  );
}
