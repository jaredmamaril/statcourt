"use client";

import { ArrowRight, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const secondaryLinkClass =
  "inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.08)] px-3 py-2.5 font-michroma text-[11px] uppercase tracking-[0.04em] text-white/85 transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgb(var(--court-accent-rgb)/0.6)] hover:bg-[rgb(var(--court-accent-rgb)/0.14)] hover:text-white hover:shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--court-accent-rgb)/0.75)] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95 lg:text-xs";

export default function Home() {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const authMessage = (
      params.get("message") ??
      hashParams.get("message") ??
      ""
    ).toLowerCase();
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

    if (authMessage.includes("confirmation link accepted")) {
      router.replace("/signin?notice=email_change_needs_second_confirmation");
      return;
    }

    if (!hasAuthCallbackParams) return;

    router.replace(`/auth/callback${window.location.search}${window.location.hash}`);
  }, [router]);

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

      <section className="relative z-10 flex min-h-screen -translate-y-10 items-center justify-center px-5 text-center">
        <div
          className={`page-enter relative mt-72 flex flex-col items-center transition-all duration-300 ${
            isLeaving ? "pointer-events-none translate-y-1 opacity-0" : ""
          }`}
        >
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

              setTimeout(
                () => {
                  router.push("/court");
                },
                reducedMotion ? 0 : 320,
              );
            }}
            className="home-cta inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-[rgb(var(--court-accent-rgb)/0.6)] bg-[rgb(var(--court-accent-rgb)/0.2)] px-8 py-3.5 font-michroma text-sm text-white shadow-[0_0_24px_rgb(var(--court-accent-rgb)/0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgb(var(--court-accent-rgb)/0.9)] hover:bg-[rgb(var(--court-accent-rgb)/0.28)] hover:shadow-[0_0_30px_rgb(var(--court-accent-rgb)/0.3)] active:scale-95 sm:text-base lg:px-10 lg:py-4 lg:text-lg"
          >
            <span>ENTER THE COURT</span>
            <ArrowRight
              className="home-cta-arrow h-4 w-4 lg:h-5 lg:w-5"
              aria-hidden="true"
            />
          </button>
          <div className="absolute inset-x-0 top-full mt-3 flex flex-col gap-3 lg:flex-row">
            <Link
              href="/players"
              className={secondaryLinkClass}
            >
              <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>PLAYER PEAKS</span>
            </Link>
            <Link
              href="/lineups"
              className={secondaryLinkClass}
            >
              <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>BUILD LINEUP</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
