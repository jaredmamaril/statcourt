"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// Back / Browse Players bar shared by the player profile, the 404 page and the
// "Which Mike James?" page.
export function PlayerPageNav() {
  const router = useRouter();

  return (
    <div className="mb-3 flex items-center justify-between gap-3 lg:mb-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="rounded-md border border-white/25 bg-white/8 px-3 py-2 font-michroma text-[8px] uppercase text-white/75 shadow-[0_0_12px_rgba(255,255,255,0.08)] transition hover:scale-[1.02] hover:border-white/45 hover:bg-white/12 hover:text-white lg:px-4 lg:text-[10px]"
      >
        Back
      </button>

      <Link
        href="/players"
        className="rounded-md border border-[rgb(var(--court-accent-rgb)/0.7)] bg-[rgb(var(--court-accent-rgb)/0.16)] px-3 py-2 font-michroma text-[8px] uppercase text-[var(--court-accent)] shadow-[0_0_14px_rgb(var(--court-accent-rgb)/0.16)] transition hover:scale-[1.02] hover:bg-[rgb(var(--court-accent-rgb)/0.24)] lg:px-4 lg:text-[10px]"
      >
        Browse Players
      </Link>
    </div>
  );
}

export function PlayerNotFoundMessage() {
  return (
    <div className="mx-auto mt-8 max-w-md rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-center">
      <h1 className="font-michroma text-sm uppercase text-red-200">
        Player Not Found
      </h1>
      <p className="mt-3 font-michroma text-[9px] leading-relaxed text-white/45">
        This player is not available in the current StatCourt database.
      </p>
    </div>
  );
}

// The page shell (background pattern, centered column) around these screens.
export function PlayerPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="page-enter relative min-h-screen overflow-x-hidden bg-background px-3 pb-10 pt-3 text-white lg:px-6 lg:pt-10">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-center bg-repeat opacity-100"
        style={{
          backgroundImage: "var(--court-pattern)",
          backgroundSize: "900px auto",
        }}
      />
      <section className="relative z-10 mx-auto max-w-6xl">{children}</section>
    </main>
  );
}
