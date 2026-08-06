import Link from "next/link";
import { Activity, Database, Eye, LockKeyhole, Shield } from "lucide-react";

const dataItems = [
  {
    title: "Account Info",
    description:
      "Your email, display name, username, avatar, and sign-in method are used to run your StatCourt account.",
  },
  {
    title: "Basketball Data",
    description:
      "Saved lineups, favorite players, recent activity, and public profile choices are stored so your court hub works across sessions.",
  },
  {
    title: "Profile Visibility",
    description:
      "Public profiles only show the details you choose to make public, such as public lineups, favorite players, and basketball identity.",
  },
  {
    title: "Security Activity",
    description:
      "Recent sign-ins and remembered devices help you understand account access and manage stale sessions.",
  },
];

const userControls = [
  "Change your display name and username from Settings.",
  "Turn your public profile on or off from Settings.",
  "Clear recent activity from your Profile page.",
  "Delete saved lineups, favorites, and account data from your account tools.",
];

export default function PrivacyPage() {
  return (
    <main className="page-enter relative min-h-screen overflow-x-hidden px-3 py-8 text-white lg:px-6 lg:py-12">
      <section className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="rounded-lg border border-[rgb(var(--court-accent-rgb)/0.24)] bg-[color:color-mix(in_srgb,var(--court-panel)_82%,transparent)] p-4 shadow-[0_0_28px_rgba(0,0,0,0.26)] lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.1)] text-[var(--court-accent)] lg:h-10 lg:w-10">
                  <Shield className="h-4 w-4 lg:h-5 lg:w-5" />
                </div>

                <p className="font-michroma text-[8px] uppercase text-[var(--court-accent)] lg:text-[10px]">
                  StatCourt Privacy
                </p>
              </div>

              <h1 className="mt-4 font-michroma text-xl uppercase leading-tight text-white lg:text-4xl">
                Your Court Data
              </h1>

              <p className="mt-3 font-michroma text-[8px] leading-relaxed text-white/48 lg:max-w-3xl lg:text-xs">
                StatCourt uses your account data to save lineups, remember
                favorite players, personalize your profile, and keep your
                scouting activity connected to your signed-in account.
              </p>
            </div>

            <Link
              href="/settings"
              className="inline-flex h-9 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.45)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-4 font-michroma text-[7px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] hover:text-white lg:h-10 lg:text-[9px]"
            >
              Privacy Settings
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:mt-6 lg:grid-cols-2 lg:gap-4">
          {dataItems.map((item, index) => {
            const Icon =
              index === 0
                ? LockKeyhole
                : index === 1
                  ? Database
                  : index === 2
                    ? Eye
                    : Activity;

            return (
              <section
                key={item.title}
                className="rounded-lg border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_80%,transparent)] p-3 lg:p-5"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.28)] bg-[rgb(var(--court-accent-rgb)/0.08)] text-[var(--court-accent)] lg:h-9 lg:w-9">
                    <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  </div>

                  <h2 className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                    {item.title}
                  </h2>
                </div>

                <p className="mt-3 font-michroma text-[7px] leading-relaxed text-white/42 lg:text-[10px]">
                  {item.description}
                </p>
              </section>
            );
          })}
        </div>

        <section className="mt-4 rounded-lg border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_80%,transparent)] p-3 lg:mt-6 lg:p-5">
          <h2 className="font-michroma text-[10px] uppercase text-white lg:text-sm">
            Your Controls
          </h2>

          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {userControls.map((control) => (
              <div
                key={control}
                className="rounded-md border border-[rgb(var(--court-accent-rgb)/0.14)] bg-black/20 p-2 font-michroma text-[7px] leading-relaxed text-white/48 lg:p-3 lg:text-[9px]"
              >
                {control}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 lg:mt-6 lg:p-5">
          <p className="font-michroma text-[8px] uppercase text-white/35 lg:text-[10px]">
            Preview Notice
          </p>

          <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/40 lg:text-[9px]">
            This page is a product privacy summary for the current StatCourt
            preview. A formal privacy policy can be added before public launch.
          </p>
        </section>
      </section>
    </main>
  );
}
