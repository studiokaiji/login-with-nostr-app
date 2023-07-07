"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { SimplePool } from "nostr-tools";
import { ProfileCard } from "#/components/ProfileCard";

const relays = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.wirednet.jp",
  "wss://relay-jp.nostr.wirednet.jp",
  "wss://nostr-relay.nokotaro.com",
];

export default function Home() {
  const [usersCount, setUsersCount] = useState<number>();
  const [users, setUsers] = useState<
    {
      pubkey: string;
      profile: Profile;
    }[]
  >();

  const [myProfile, setMyProfile] = useState<{
    pubkey: string;
    profile: Profile;
  }>();

  const pool = useMemo(() => new SimplePool(), []);

  useLayoutEffect(() => {
    fetch("/api/users/count", {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch users count");
        }
        const data = await res.json();
        setUsersCount(data.count);
      })
      .catch((e) => {
        console.error(e);
      });

    fetch("/api/users/recent", {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await res.json();

        const events = await pool.list(
          relays,
          data.users.map((pubkey: string) => ({
            kinds: [0],
            authors: [pubkey],
          }))
        );

        const users = events.map((event) => ({
          profile: JSON.parse(event.content),
          pubkey: event.pubkey,
        }));
        setUsers(users);
      })
      .catch((e) => {
        console.error(e);
        setUsers([]);
      });
  }, [pool]);

  const signInWithNostr = useCallback(async () => {
    if (!window.nostr) {
      console.error("NIP-07 client is required.");
      return;
    }

    try {
      const pubkey = await window.nostr.getPublicKey();

      const signedEvent = await window.nostr.signEvent({
        kind: 27235,
        created_at: Date.now(),
        tags: [
          [
            "u",
            `${window.location.protocol}//${window.location.host}/api/auth`,
          ],
          ["method", "GET"],
        ],
        content: "",
        pubkey,
      });

      const token = btoa(JSON.stringify(signedEvent));

      const res = await fetch("/api/auth", {
        method: "GET",
        headers: {
          Authorization: `Nostr ${token}`,
        },
        cache: 'no-store'
      });

      if (!res.ok) {
        alert(`${res.status}\n${res.statusText}`);
      }

      const resJson = await res.json();
      const isNew: boolean = resJson["isNewUser"];
      if (isNew && usersCount) {
        setUsersCount(usersCount + 1);
      }
    } catch (error) {
      console.error(error);
    }
  }, [usersCount]);

  useEffect(() => {
    signInWithNostr().then(async () => {
      const pubkey = await window.nostr!.getPublicKey();
      const event = await pool.get(relays, { kinds: [0], authors: [pubkey] });
      if (!event) {
        return;
      }
      setMyProfile({
        profile: JSON.parse(event.content),
        pubkey: event.pubkey,
      });
    });
  }, [signInWithNostr, pool]);

  return (
    <main className="flex flex-col space-y-7 p-7">
      <div className="absolute right-7 top-7">
        {myProfile && <ProfileCard {...myProfile} />}
      </div>
      <h1 className="text-5xl font-bold">🫡Nostr Auth</h1>
      <div className="flex max-w-xs flex-col space-y-3">
        <h3 className="text-xl font-medium">🫂 Recent Users</h3>
        {users ? (
          users.map((profile, i) => (
            <div className="inline-block" key={`profiles-${i}`}>
              <ProfileCard {...profile} />
            </div>
          ))
        ) : (
          <div className="mt-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-400 border-t-transparent"></div>
        )}
      </div>
      <h3 className="flex items-center space-x-2 text-xl font-medium">
        <span>💃🕺 All Users :</span>
        {usersCount === undefined ? (
          <span className="inline-block h-6 w-6 animate-pulse rounded bg-slate-200"></span>
        ) : (
          <span>{usersCount}</span>
        )}
      </h3>
    </main>
  );
}
