import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";

// Shown, with a real 404 status, when /u/{username} isn't a public profile. Same look
// as the profile page's "Profile Not Found" state. Next.js adds
// <meta name="robots" content="noindex"> to 404 responses.
export const metadata: Metadata = {
  title: "Profile Not Found",
};

export default function PublicProfileNotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--court-panel-alt)] px-4 py-6 text-white lg:px-8 lg:py-10">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.28]"
        style={{
          backgroundImage: "var(--court-pattern)",
          backgroundPosition: "top left",
          backgroundSize: "900px auto",
        }}
      />

      <section className="relative z-10 mx-auto max-w-4xl">
        <Link
          href="/community"
          className="inline-flex rounded-md border border-[rgb(var(--court-accent-rgb)/0.4)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-3 py-2 font-michroma text-[8px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] hover:text-white lg:text-[10px]"
        >
          Back to Community
        </Link>

        <div className="mt-4 rounded-lg border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[color:color-mix(in_srgb,var(--court-panel)_85%,transparent)] p-3 shadow-[0_0_26px_rgba(0,0,0,0.28)] lg:mt-8 lg:p-7">
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-md border border-white/10 bg-black/25 text-white/40">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </div>

            <h1 className="mt-5 font-michroma text-lg uppercase text-white lg:text-3xl">
              Profile Not Found
            </h1>

            <p className="mt-3 max-w-md font-michroma text-[8px] leading-relaxed text-white/45 lg:text-xs">
              This StatCourt profile is private, disabled, or does not exist.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
