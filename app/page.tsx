"use client";

import { useState } from "react";

export default function Home() {
  const [res, setRes] = useState("");
  const echo = async () => {
    const r = await fetch("/echo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Hello" }),
    });
    if (r.status === 200) {
      setRes(JSON.stringify(await r.json(), null, 2));
    }
  };
  return (
    <main className="flex h-screen flex-col items-center justify-center p-7">
      <h1 className="text-5xl font-semibold">Login with Nostr</h1>
      <div>
        <button onClick={echo}>ECHO</button>
      </div>
      {res && <pre>{res}</pre>}
    </main>
  );
}
