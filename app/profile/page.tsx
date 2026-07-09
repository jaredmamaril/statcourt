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
    <main className="relative min-h-svh bg-background px-3 py-3 text-white lg:px-6 lg:pt-12">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{
          backgroundImage: "url('/court-pattern.svg')",
        }}
      />

      <section className="relative z-10 mx-auto max-w-5xl py-3 lg:py-10">
        <div className="mb-3 rounded-lg border border-[#1bc2ec]/30 bg-[#06131d]/80 p-3 shadow-[0_0_22px_rgba(27,194,236,0.12)] lg:mb-8 lg:p-6 lg:shadow-[0_0_30px_rgba(27,194,236,0.14)]">
          <div className="flex items-center justify-between gap-3 lg:gap-5">
            <div>
              <p className="font-michroma text-[7px] uppercase tracking-wide text-[#1bc2ec] lg:text-[10px]">
                Court Hub
              </p>

              <h1 className="mt-1 font-michroma text-base uppercase text-white lg:mt-2 lg:text-3xl">
                Welcome back, Tyler
              </h1>

              <p className="mt-1.5 font-michroma text-[6px] uppercase tracking-wide text-white/45 lg:mt-3 lg:text-[11px]">
                Your Court is ready.
              </p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 font-michroma text-xs text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.18)] lg:h-16 lg:w-16 lg:text-xl lg:shadow-[0_0_24px_rgba(27,194,236,0.22)]">
              T
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
          {accountStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group cursor-pointer rounded-lg border border-white/10 bg-[#06131d]/80 p-2.5 shadow-[0_0_16px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:bg-[#071827]/90 hover:shadow-[0_0_26px_rgba(27,194,236,0.16)] lg:p-4"
              >
                <div
                  className="mb-2 flex h-7 w-7 items-center justify-center rounded-md border bg-white/5 transition duration-200 group-hover:scale-105 group-hover:brightness-125 lg:mb-4 lg:h-9 lg:w-9"
                  style={{
                    borderColor: `${stat.color}80`,
                    color: stat.color,
                    boxShadow: `0 0 16px ${stat.color}33`,
                  }}
                >
                  <Icon className="h-3 w-3 lg:h-4 lg:w-4" />
                </div>

                <p className="font-michroma text-[6px] uppercase tracking-wide text-white/35 lg:text-[8px]">
                  {stat.label}
                </p>

                <p
                  className="mt-1 font-michroma text-[10px] text-white lg:mt-2 lg:text-xl"
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

        <div className="mt-3 grid gap-2 lg:mt-6 lg:grid-cols-[1fr_1fr] lg:gap-4">
          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-3 lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-4 lg:gap-3">
              <Activity className="h-3.5 w-3.5 text-[#1bc2ec] lg:h-5 lg:w-5" />
              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Recent Activity
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-black/20 p-3 text-center lg:p-5">
              <p className="font-michroma text-[10px] text-white/60 lg:text-sm">
                No activity yet.
              </p>

              <p className="mt-1.5 font-michroma text-[6px] leading-relaxed text-white/35 lg:mt-2 lg:text-[9px]">
                Saved lineups, favorites, and scouting actions will appear here.
              </p>

              <Link
                href="/players"
                className="mt-2.5 inline-flex rounded-md border border-[#1bc2ec]/45 bg-[#1bc2ec]/10 px-3 py-2 font-michroma text-[7px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white lg:mt-4 lg:px-4 lg:py-2.5 lg:text-[9px]"
              >
                Browse Players
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-3 lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-4 lg:gap-3">
              <Shield className="h-3.5 w-3.5 text-[#EFBF04] lg:h-5 lg:w-5" />
              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Quick Actions
              </p>
            </div>

            <div className="grid gap-2 lg:gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-2 font-michroma text-[7px] uppercase text-white/75 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/45 hover:bg-[#1bc2ec]/10 hover:text-white hover:shadow-[0_0_22px_rgba(27,194,236,0.18)] lg:gap-3 lg:px-4 lg:py-3 lg:text-[10px]"
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-md border bg-white/5 transition duration-200 group-hover:scale-105 group-hover:brightness-125 lg:h-8 lg:w-8"
                      style={{
                        borderColor: `${action.color}70`,
                        color: action.color,
                      }}
                    >
                      <Icon className="h-3 w-3 lg:h-4 lg:w-4" />
                    </span>

                    {action.label}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-3 rounded-lg border border-white/10 bg-[#06131d]/80 p-3 lg:mt-6 lg:p-5">
          <div className="mb-2.5 flex items-center gap-2 lg:mb-4 lg:gap-3">
            <Users className="h-3.5 w-3.5 text-white/50 lg:h-5 lg:w-5" />
            <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
              Account Status
            </p>
          </div>

          <p className="font-michroma text-[6px] leading-relaxed text-white/40 lg:text-[9px]">
            Your account hub will track saved lineups, favorite players, and
            recent scouting activity once your data is connected.
          </p>
        </div>
      </section>
    </main>
  );
}
