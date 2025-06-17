"use client";

import { Greeting } from "hive-sync";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Greeting
        name="Developer"
        message="Welcome to your test app using Hive Sync!"
      />
    </main>
  );
}
