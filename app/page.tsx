"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [showEnterButton, setShowEnterButton] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowEnterButton(true);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main
      className={`relative min-h-screen overflow-hidden bg-background text-foreground transition-all duration-700 ease-out ${
        isLeaving ? "scale-105 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover object-center brightness-150"
        src="/statcourt-home-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />

      <div className="absolute inset-0 bg-black/65" />

      <section className="relative z-10 flex min-h-screen -translate-y-10 items-center justify-center text-center">
        <button
          type="button"
          onClick={() => {
            setIsLeaving(true);

            setTimeout(() => {
              router.push("/court");
            }, 650);
          }}
          className={`mt-78 cursor-pointer rounded-md border border-[rgb(var(--court-accent-rgb)/0.45)] bg-[rgb(var(--court-accent-rgb)/0.16)] px-6 py-3 font-michroma text-base text-white shadow-md transition-all duration-500 hover:-translate-y-0.5 hover:border-[rgb(var(--court-accent-rgb)/0.75)] hover:bg-[rgb(var(--court-accent-rgb)/0.14)] active:scale-95 ${
            showEnterButton
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0"
          }`}
        >
          ENTER THE COURT
        </button>
      </section>
    </main>
  );
}
