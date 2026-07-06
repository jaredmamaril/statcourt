import Link from "next/link";
import {
  Bookmark,
  Clock,
  LayoutDashboard,
  Shield,
  Star,
  Trophy,
} from "lucide-react";

const accountStats = [
  {
    label: "Saved Lineups",
    value: "0",
    icon: Bookmark,
    color: "#1bc2ec",
  },
  {
    label: "Favorite Players",
    value: "0",
    icon: Star,
    color: "#EFBF04",
  },
  {
    label: "Recently Viewed",
    value: "0",
    icon: Clock,
    color: "#A855F7",
  },
  {
    label: "Favorite Archetype",
    value: "Not enough data yet",
    icon: Trophy,
    color: "#22C55E",
  },
];

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background px-6 pt-12 text-white">
      <section className="mx-auto max-w-5xl py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-michroma text-[10px] uppercase tracking-wide text-[#1bc2ec]">
              StatCourt Account
            </p>

            <h1 className="mt-2 font-michroma text-3xl uppercase text-white">
              Welcome back, Tyler
            </h1>

            <p className="mt-3 max-w-xl font-michroma text-[10px] leading-relaxed text-white/45">
              Your saved builds, player history, and scouting activity will live
              here once account sync is connected.
            </p>
          </div>

          <div className="hidden h-16 w-16 items-center justify-center rounded-lg border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 font-michroma text-xl text-[#1bc2ec] shadow-[0_0_24px_rgba(27,194,236,0.22)] sm:flex">
            T
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {accountStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-lg border border-white/10 bg-[#06131d]/80 p-4 shadow-[0_0_18px_rgba(0,0,0,0.25)]"
              >
                <div
                  className="mb-4 flex h-9 w-9 items-center justify-center rounded-md border bg-white/5"
                  style={{
                    borderColor: `${stat.color}80`,
                    color: stat.color,
                    boxShadow: `0 0 16px ${stat.color}33`,
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <p className="font-michroma text-[8px] uppercase tracking-wide text-white/35">
                  {stat.label}
                </p>

                <p
                  className="mt-2 font-michroma text-xl text-white"
                  style={{
                    color: stat.color,
                    textShadow: `0 0 14px ${stat.color}55`,
                  }}
                >
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-[#1bc2ec]/25 bg-[#06131d]/80 p-5 shadow-[0_0_24px_rgba(27,194,236,0.12)]">
            <div className="mb-4 flex items-center gap-3">
              <LayoutDashboard className="h-5 w-5 text-[#1bc2ec]" />
              <p className="font-michroma text-sm uppercase text-white">
                Account Hub
              </p>
            </div>

            <p className="font-michroma text-[10px] leading-relaxed text-white/45">
              This page will become your personal StatCourt dashboard: saved
              lineups, favorite players, compare history, and scouting patterns.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/lineups"
                className="rounded-md border border-[#1bc2ec]/45 bg-[#1bc2ec]/10 px-4 py-3 font-michroma text-[9px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white"
              >
                View Lineups
              </Link>

              <Link
                href="/players"
                className="rounded-md border border-white/10 bg-white/5 px-4 py-3 font-michroma text-[9px] uppercase text-white/55 transition hover:border-white/25 hover:text-white"
              >
                Browse Players
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#06131d]/80 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-white/50" />
              <p className="font-michroma text-sm uppercase text-white">
                Account Status
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-black/20 p-4">
              <p className="font-michroma text-[9px] uppercase text-white/35">
                Sync Status
              </p>

              <p className="mt-2 font-michroma text-sm text-[#1bc2ec]">
                Temporary Preview
              </p>

              <p className="mt-3 font-michroma text-[9px] leading-relaxed text-white/40">
                Real authentication is not connected yet. These values are
                placeholders until Supabase auth and account tables are wired
                in.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
