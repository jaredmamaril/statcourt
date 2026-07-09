import Link from "next/link";
import {
  Activity,
  Bookmark,
  Clock,
  LayoutDashboard,
  Search,
  Shield,
  Star,
  Trophy,
  Users,
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

const quickActions = [
  {
    label: "Build Lineup",
    href: "/lineups?tab=builder",
    icon: LayoutDashboard,
    color: "#1bc2ec",
  },
  {
    label: "Browse Players",
    href: "/players",
    icon: Search,
    color: "#A855F7",
  },
  {
    label: "View Saved Lineups",
    href: "/lineups?tab=saved",
    icon: Bookmark,
    color: "#EFBF04",
  },
];

export default function ProfilePage() {
  return (
    <main className="relative min-h-screen bg-background px-6 pt-12 text-white">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{
          backgroundImage: "url('/court-pattern.svg')",
        }}
      />

      <section className="relative z-10 mx-auto max-w-5xl py-10">
        <div className="mb-8 rounded-lg border border-[#1bc2ec]/30 bg-[#06131d]/80 p-6 shadow-[0_0_30px_rgba(27,194,236,0.14)]">
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="font-michroma text-[10px] uppercase tracking-wide text-[#1bc2ec]">
                Court Hub
              </p>

              <h1 className="mt-2 font-michroma text-3xl uppercase text-white">
                Welcome back, Tyler
              </h1>

              <p className="mt-3 font-michroma text-[11px] uppercase tracking-wide text-white/45">
                Your Court is ready.
              </p>
            </div>

            <div className="hidden h-16 w-16 items-center justify-center rounded-lg border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 font-michroma text-xl text-[#1bc2ec] shadow-[0_0_24px_rgba(27,194,236,0.22)] sm:flex">
              T
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {accountStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group cursor-pointer rounded-lg border border-white/10 bg-[#06131d]/80 p-4 shadow-[0_0_18px_rgba(0,0,0,0.25)] transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:bg-[#071827]/90 hover:shadow-[0_0_26px_rgba(27,194,236,0.16)]"
              >
                <div
                  className="mb-4 flex h-9 w-9 items-center justify-center rounded-md border bg-white/5 transition duration-200 group-hover:scale-105 group-hover:brightness-125"
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

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Activity className="h-5 w-5 text-[#1bc2ec]" />
              <p className="font-michroma text-sm uppercase text-white">
                Recent Activity
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-black/20 p-5 text-center">
              <p className="font-michroma text-sm text-white/60">
                No activity yet.
              </p>

              <p className="mt-2 font-michroma text-[9px] leading-relaxed text-white/35">
                Saved lineups, favorites, and scouting actions will appear here.
              </p>

              <Link
                href="/players"
                className="mt-4 inline-flex rounded-md border border-[#1bc2ec]/45 bg-[#1bc2ec]/10 px-4 py-2.5 font-michroma text-[9px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white"
              >
                Browse Players
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-[#EFBF04]" />
              <p className="font-michroma text-sm uppercase text-white">
                Quick Actions
              </p>
            </div>

            <div className="grid gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-md border border-white/10 bg-black/20 px-4 py-3 font-michroma text-[10px] uppercase text-white/75 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/45 hover:bg-[#1bc2ec]/10 hover:text-white hover:shadow-[0_0_22px_rgba(27,194,236,0.18)]"
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-md border bg-white/5 transition duration-200 group-hover:scale-105 group-hover:brightness-125"
                      style={{
                        borderColor: `${action.color}70`,
                        color: action.color,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    {action.label}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-[#06131d]/80 p-5">
          <div className="mb-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-white/50" />
            <p className="font-michroma text-sm uppercase text-white">
              Account Status
            </p>
          </div>

          <p className="font-michroma text-[9px] leading-relaxed text-white/40">
            Your account hub will track saved lineups, favorite players, and
            recent scouting activity once your data is connected.
          </p>
        </div>
      </section>
    </main>
  );
}
