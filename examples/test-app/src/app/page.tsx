"use client";

import { Demo } from "@/components/demo";
import { Hive } from "hive-sync";
import Link from "next/link";
import { useRef } from "react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <main
      className="h-full w-full relative p-6 pb-[500px] contain-paint"
      ref={containerRef}
    >
      <nav className="mb-20">
        <Link href="/" className="text-2xl">
          🐝 Hive
        </Link>
      </nav>
      <Demo />
      <Hive containerRef={containerRef} />
    </main>
  );
}
