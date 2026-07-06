import Image from "next/image";
import Link from "next/link";
import { Mail, Shield, Sparkles } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 pt-12 text-white">
      <Image
        src="/court-pattern.svg"
        alt="Court background"
        fill
        priority
        className="object-cover"
      />
      <section className="relative mx-auto flex min-h-[calc(100vh-120px)] max-w-md items-center justify-center">
        <div className="w-full rounded-lg border border-[#1bc2ec]/40 bg-[#06131d]/85 p-6 shadow-[0_0_36px_rgba(27,194,236,0.2)]">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-lg border border-[#1bc2ec]/45 bg-[#1bc2ec]/10 shadow-[0_0_24px_rgba(27,194,236,0.22)]">
              <Image
                src="/statcourt-logo.svg"
                alt="StatCourt"
                width={64}
                height={64}
                priority
              />
            </div>

            <p className="font-michroma text-[12px] uppercase tracking-wide font-bold text-[#1bc2ec]">
              StatCourt
            </p>

            <h1 className="mt-3 font-michroma text-2xl uppercase text-white">
              Build your roster identity.
            </h1>

            <p className="mt-3 font-michroma text-[10px] uppercase tracking-wide text-white/45">
              Build. Save. Scout.
            </p>
          </div>

          <div className="mb-5 rounded-md border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-center gap-2 font-michroma text-[8px] uppercase text-white/35">
              <Shield className="h-3.5 w-3.5 text-[#1bc2ec]" />
              Locker Room Access
            </div>

            <p className="mt-2 font-michroma text-[9px] leading-relaxed text-white/45 text-center">
              Save lineups, track favorites, and keep your scouting history tied
              to your account.
            </p>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              className="group flex items-center justify-center gap-2 rounded-md border border-[#1bc2ec]/55 bg-[#1bc2ec]/10 px-4 py-3 font-michroma text-[10px] uppercase text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.14)] transition hover:bg-[#1bc2ec]/20 hover:text-white hover:shadow-[0_0_24px_rgba(27,194,236,0.28)]"
            >
              <Mail className="h-4 w-4 transition group-hover:brightness-125" />
              Continue with Email
            </button>

            <button
              type="button"
              className="group flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-3 font-michroma text-[10px] uppercase text-white/65 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <Sparkles className="h-4 w-4 text-[#EFBF04]" />
              Continue with Google
            </button>
          </div>

          <Link
            href="/players"
            className="mt-6 block text-center font-michroma text-[9px] uppercase text-white/35 transition hover:text-[#1bc2ec]"
          >
            Keep Browsing
          </Link>
        </div>
      </section>
    </main>
  );
}
