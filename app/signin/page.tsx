import Image from "next/image";
import Link from "next/link";
import { Mail, Shield, Sparkles } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="page-enter relative min-h-svh overflow-hidden bg-background px-3 py-4 text-white lg:px-6 lg:pt-12">
      <Image
        src="/court-pattern.svg"
        alt="Court background"
        fill
        priority
        className="object-cover"
      />

      <section className="relative mx-auto flex min-h-[calc(100svh-32px)] max-w-[320px] items-center justify-center lg:min-h-[calc(100vh-120px)] lg:max-w-md">
        <div className="w-full rounded-lg border border-[#1bc2ec]/40 bg-[#06131d]/85 p-3.5 shadow-[0_0_24px_rgba(27,194,236,0.16)] lg:p-6 lg:shadow-[0_0_36px_rgba(27,194,236,0.2)]">
          <div className="mb-3.5 flex flex-col items-center text-center lg:mb-6">
            <div className="mb-2.5 flex h-14 w-14 items-center justify-center rounded-lg border border-[#1bc2ec]/45 bg-[#1bc2ec]/10 shadow-[0_0_18px_rgba(27,194,236,0.18)] lg:mb-4 lg:h-20 lg:w-20 lg:shadow-[0_0_24px_rgba(27,194,236,0.22)]">
              <Image
                src="/statcourt-logo.svg"
                alt="StatCourt"
                width={44}
                height={44}
                priority
                className="lg:h-16 lg:w-16"
              />
            </div>

            <p className="font-michroma text-[9px] font-bold uppercase tracking-wide text-[#1bc2ec] lg:text-[12px]">
              StatCourt
            </p>

            <h1 className="mt-2.5 font-michroma text-sm uppercase leading-snug text-white lg:mt-3 lg:text-2xl">
              Build your roster identity.
            </h1>

            <p className="mt-2 font-michroma text-[7px] uppercase tracking-wide text-white/45 lg:mt-3 lg:text-[10px]">
              Build. Save. Scout.
            </p>
          </div>

          <div className="mb-3 rounded-md border border-white/10 bg-black/20 p-2.5 lg:mb-5 lg:p-3">
            <div className="flex items-center justify-center gap-1.5 font-michroma text-[6px] uppercase text-white/35 lg:gap-2 lg:text-[8px]">
              <Shield className="h-3 w-3 text-[#1bc2ec] lg:h-3.5 lg:w-3.5" />
              Locker Room Access
            </div>

            <p className="mt-1.5 text-center font-michroma text-[7px] leading-relaxed text-white/45 lg:mt-2 lg:text-[9px]">
              Save lineups, track favorites, and keep your scouting history tied
              to your account.
            </p>
          </div>

          <div className="grid gap-2 lg:gap-3">
            <button
              type="button"
              className="group flex items-center justify-center gap-2 rounded-md border border-[#1bc2ec]/55 bg-[#1bc2ec]/10 px-3 py-2 font-michroma text-[7px] uppercase text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.14)] transition hover:bg-[#1bc2ec]/20 hover:text-white hover:shadow-[0_0_24px_rgba(27,194,236,0.28)] lg:px-4 lg:py-3 lg:text-[10px]"
            >
              <Mail className="h-3 w-3 transition group-hover:brightness-125 lg:h-4 lg:w-4" />
              Continue with Email
            </button>

            <button
              type="button"
              className="group flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 font-michroma text-[7px] uppercase text-white/65 transition hover:border-white/30 hover:bg-white/10 hover:text-white lg:px-4 lg:py-3 lg:text-[10px]"
            >
              <Sparkles className="h-3 w-3 text-white/55 transition group-hover:text-white lg:h-4 lg:w-4" />{" "}
              Continue with Google
            </button>
          </div>

          <p className="mt-2.5 text-center font-michroma text-[6px] leading-relaxed text-white/30 lg:mt-4 lg:text-[8px]">
            Authentication preview only. Real sign-in will connect later.
          </p>

          <Link
            href="/players"
            className="mt-2.5 block text-center font-michroma text-[7px] uppercase tracking-[0.2em] text-white/35 transition hover:text-[#1bc2ec] lg:mt-3 lg:text-[9px] lg:tracking-[0.25em]"
          >
            Continue Browsing
          </Link>
        </div>
      </section>
    </main>
  );
}
