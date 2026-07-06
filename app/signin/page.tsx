import Link from "next/link";
import { LogIn } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-background px-6 pt-12 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-120px)] max-w-md items-center justify-center">
        <div className="w-full rounded-lg border border-[#1bc2ec]/35 bg-[#06131d]/80 p-6 shadow-[0_0_32px_rgba(27,194,236,0.18)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#1bc2ec]/40 bg-[#1bc2ec]/10 text-[#1bc2ec]">
              <LogIn className="h-5 w-5" />
            </div>

            <div>
              <h1 className="font-michroma text-lg uppercase text-white">
                Sign In
              </h1>
              <p className="mt-1 font-michroma text-[9px] text-white/40">
                StatCourt account access
              </p>
            </div>
          </div>

          <p className="font-michroma text-[10px] leading-relaxed text-white/55">
            Sign in will connect saved lineups, favorite players, comparison
            history, and scouting activity to your account.
          </p>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              className="rounded-md border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-4 py-3 font-michroma text-[10px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white"
            >
              Continue with Email
            </button>

            <button
              type="button"
              className="rounded-md border border-white/10 bg-white/5 px-4 py-3 font-michroma text-[10px] uppercase text-white/55 transition hover:border-white/25 hover:text-white"
            >
              Continue with Google
            </button>
          </div>

          <Link
            href="/players"
            className="mt-5 block text-center font-michroma text-[9px] uppercase text-white/35 transition hover:text-[#1bc2ec]"
          >
            Keep Browsing
          </Link>
        </div>
      </section>
    </main>
  );
}
