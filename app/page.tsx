"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Event, SimplePool } from "nostr-tools";
import { ProfileCard } from "#/components/ProfileCard";
import { Button } from "#/components/Button";

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

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const [myProfile, setMyProfile] = useState<{
    pubkey: string;
    profile: Profile;
  }>();

  const [changedUsersState, setChangedUsersState] = useState(false);

  const pool = useMemo(() => new SimplePool(), []);

  useEffect(() => {
    if (usersCount !== undefined && users !== undefined && !changedUsersState) {
      console.log("aaaaa");
      return;
    }

    fetch("/api/users/count", {
      next: { revalidate: 0 },
      cache: "reload",
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
      next: { revalidate: 0 },
      cache: "reload",
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await res.json();

        const sub = pool.sub(
          relays,
          data.users.map((pubkey: string) => ({
            kinds: [0],
            authors: [pubkey],
          }))
        );

        const events: { [key: string]: Event } = {};

        await new Promise<void>((resolve) => {
          sub.on("event", (event) => {
            events[event.pubkey] = event;
            if (Object.keys(events).length >= data.users.length) {
              resolve();
            }
          });

          sub.on("eose", () => {
            if (myProfile) {
              pool.close(relays);
              resolve();
            }
          });

          setTimeout(() => resolve(), 5000);
        });

        const users: {
          pubkey: string;
          profile: Profile;
        }[] = [];
        data.users.forEach((userPubKey: string) => {
          const event = events[userPubKey];
          if (!event) return;
          users.push({
            profile: event ? JSON.parse(event.content) : null,
            pubkey: userPubKey,
          });
        });
        setUsers(users);
      })
      .catch((e) => {
        console.error(e);
        setUsers([]);
      });

    setChangedUsersState(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, changedUsersState]);

  const signInWithNostr = useCallback(async () => {
    if (!window.nostr) {
      console.error("NIP-07 client is required.");
      return;
    }

    setIsAuthenticating(true);

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
        next: { revalidate: 0 },
        cache: "reload",
      });

      if (!res.ok) {
        alert(`${res.status}\n${res.statusText}`);
      }

      const resJson = await res.json();
      const isNew: boolean = resJson["isNewUser"];
      if (isNew) {
        setChangedUsersState(true);
      }

      const event = await pool.get(relays, {
        kinds: [0],
        authors: [pubkey],
      });
      if (!event) {
        return;
      }
      if (users) {
        pool.close(relays);
      }

      const profile = JSON.parse(event.content);

      setMyProfile({
        profile,
        pubkey: event.pubkey,
      });

      console.log(isNew);

      if (isNew) {
        setUsers([profile, ...(users || [])].slice(0, 4));
        setUsersCount((usersCount || 0) + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAuthenticating(false);
    }
  }, [pool, users, usersCount, setUsersCount]);

  const removeMyData = async () => {
    try {
      setIsRemoving(true);

      const pubkey = await window.nostr!.getPublicKey();

      const signedEvent = await window.nostr!.signEvent({
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

      const res = await fetch("/api/users/my-data", {
        method: "DELETE",
        headers: {
          Authorization: `Nostr ${token}`,
        },
        next: { revalidate: 0 },
        cache: "reload",
      });
      if (!res.ok) {
        alert(`${res.status}\n${res.statusText}`);
      }

      setChangedUsersState(true);
      setMyProfile(undefined);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <main className="flex flex-col space-y-7 p-7">
      <div className="absolute right-7 top-7">
        {myProfile ? (
          <ProfileCard
            {...myProfile}
            remove={removeMyData}
            isProcessing={isRemoving}
          />
        ) : (
          <Button onClick={signInWithNostr} isProcessing={isAuthenticating}>
            Sign In With Nostr
          </Button>
        )}
      </div>
      <h1 className="text-5xl font-bold">🫡Nostr Auth Demo</h1>
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
