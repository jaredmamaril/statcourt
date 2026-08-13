"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [showEnterButton, setShowEnterButton] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hasAuthCallbackParams =
      params.has("code") ||
      params.has("token_hash") ||
      params.has("type") ||
      params.has("error") ||
      params.has("error_description") ||
      hashParams.has("access_token") ||
      hashParams.has("refresh_token") ||
      hashParams.has("token_hash") ||
      hashParams.has("type") ||
      hashParams.has("error") ||
      hashParams.has("error_description");

    if (!hasAuthCallbackParams) return;

    router.replace(`/auth/callback${window.location.search}${window.location.hash}`);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowEnterButton(true);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
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

      <div
        className={`absolute inset-0 bg-black transition-colors duration-200 ease-out ${
          isLeaving ? "bg-black/80" : "bg-black/65"
        }`}
      />

      <div
        className={`home-court-scan pointer-events-none absolute inset-y-0 left-0 z-20 w-px bg-[var(--court-accent)] shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.7)] transition-transform duration-[360ms] ease-out motion-reduce:hidden ${
          isLeaving ? "translate-x-[100vw] opacity-100" : "-translate-x-2 opacity-0"
        }`}
      />

      <section className="relative z-10 flex min-h-screen -translate-y-10 items-center justify-center text-center">
        <button
          type="button"
          onClick={() => {
            if (isLeaving) return;

            setIsLeaving(true);

            const reducedMotion =
              document.documentElement.classList.contains(
                "statcourt-reduced-motion",
              ) ||
              window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            setTimeout(() => {
              router.push("/court");
            }, reducedMotion ? 220 : 560);
          }}
          className={`mt-78 cursor-pointer rounded-md border border-[rgb(var(--court-accent-rgb)/0.45)] bg-[rgb(var(--court-accent-rgb)/0.16)] px-6 py-3 font-michroma text-base text-white shadow-md transition-all duration-500 hover:-translate-y-0.5 hover:border-[rgb(var(--court-accent-rgb)/0.75)] hover:bg-[rgb(var(--court-accent-rgb)/0.14)] active:scale-95 ${
            showEnterButton
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0"
          } ${isLeaving ? "pointer-events-none translate-y-1 opacity-0" : ""}
          `}
        >
          ENTER THE COURT
        </button>
      </section>
    </main>
  );
}
