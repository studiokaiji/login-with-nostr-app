"use client";

import { Button } from "#/components/Button";
import { useEffect, useLayoutEffect, useState } from "react";

export default function Home() {
  const [usersCount, setUsersCount] = useState<number>();
  const [err, setErr] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useLayoutEffect(() => {
    setErr("");
    fetch(
      `${window.location.protocol}//${window.location.host}/api/users/count`
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch users count");
        }
        const data = await res.json();
        setUsersCount(data.count);
      })
      .catch((e) => {
        setErr(e);
      });
  }, []);

  useEffect(() => {
    window
      .nostr!.getPublicKey()
      .then((publicKey) => {
        if (publicKey) {
          setIsLoggedIn(true);
        } else {
          throw 0;
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);

  useEffect(() => {
    if (!err) return;
    alert(err);
  }, [err]);

  const signInWithNostr = async () => {
    if (!window.nostr) {
      window.alert("NIP-07 client is required.");
      return;
    }

    try {
      setIsAuthenticating(true);

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
      });

      if (!res.ok) {
        alert(`${res.status}\n${res.statusText}`);
      }

      const resJson = await res.json();
      const isNew: boolean = resJson["isNewUser"];
      setIsNewUser(isNew);
      if (isNew && usersCount) {
        setUsersCount(usersCount + 1);
      }
    } catch (error) {
      window.alert("Failed to get Public Key...");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center space-y-7 p-7">
      <h1 className="text-5xl font-semibold">Login with Nostr</h1>
      <p className="flex items-center space-x-2 text-xl font-medium">
        <span>💃🕺 All Users:</span>
        {usersCount === undefined ? (
          <span className="inline-block h-6 w-6 animate-pulse rounded bg-slate-200"></span>
        ) : (
          <span>{usersCount}</span>
        )}
      </p>
      <div>
        <Button
          disabled={isLoggedIn}
          onClick={signInWithNostr}
          isProcessing={isAuthenticating}
        >
          Sign In With Nostr
        </Button>
      </div>
    </main>
  );
}
