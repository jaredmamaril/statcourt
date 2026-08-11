import Link from "next/link";
import {
  Activity,
  Eye,
  Shield,
  UserCog,
} from "lucide-react";
import { createSupabaseServerClient } from "../lib/supabase-ssr";

const userControls = [
  {
    title: "Profile Visibility",
    description: "Set your StatCourt profile as public or private.",
    action: "Manage Visibility",
    href: "/settings",
  },
  {
    title: "Recent Activity",
    description: "Review recent scouting activity and clear your history.",
    action: "View Activity",
    href: "/profile",
  },
  {
    title: "Public Lineups",
    description: "Choose which saved lineups can appear on your public profile.",
    action: "Manage Lineups",
    href: "/lineups?tab=saved",
  },
  {
    title: "Security & Account",
    description:
      "Manage your email, password, sign-in providers, devices, and account access.",
    action: "Account Settings",
    href: "/settings",
  },
];

function getAccountHref(path: string, isSignedIn: boolean) {
  if (isSignedIn) return path;

  return `/signin?next=${encodeURIComponent(path)}`;
}

export default async function PrivacyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = Boolean(user);

  return (
    <main className="page-enter relative min-h-screen overflow-x-hidden px-3 py-8 text-white lg:px-6 lg:py-12">
      <section className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="rounded-lg border border-[rgb(var(--court-accent-rgb)/0.24)] bg-[color:color-mix(in_srgb,var(--court-panel)_82%,transparent)] p-4 shadow-[0_0_28px_rgba(0,0,0,0.26)] lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.1)] text-[var(--court-accent)] lg:h-8 lg:w-8">
                  <Shield
                    aria-hidden="true"
                    className="h-3.5 w-3.5 lg:h-4 lg:w-4"
                  />
                </div>

                <p className="font-michroma text-[8px] uppercase text-[var(--court-accent)] lg:text-[10px]">
                  StatCourt Privacy
                </p>
              </div>

              <h1 className="mt-4 font-michroma text-xl uppercase leading-tight text-white lg:text-4xl">
                Your Court Data
              </h1>

              <p className="mt-3 font-michroma text-[8px] leading-relaxed text-white/48 lg:max-w-3xl lg:text-xs">
                Control what StatCourt stores, what appears publicly, and how
                your account data is used across the app.
              </p>
            </div>

            <Link
              href={getAccountHref("/settings", isSignedIn)}
              prefetch={isSignedIn ? undefined : false}
              className="inline-flex h-9 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.45)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-4 font-michroma text-[7px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] hover:text-white lg:h-10 lg:text-[9px]"
            >
              Privacy Settings
            </Link>
          </div>
        </div>

        <section className="mt-4 rounded-lg border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_80%,transparent)] p-3 lg:mt-6 lg:p-5">
          <h2 className="font-michroma text-[10px] uppercase text-white lg:text-sm">
            Your Privacy Controls
          </h2>

          <div className="mt-3 grid gap-2 lg:grid-cols-4">
            {userControls.map((control, index) => {
              const Icon =
                index === 0
                  ? Eye
                  : index === 1
                    ? Activity
                    : index === 2
                      ? UserCog
                      : Shield;

              return (
              <article
                key={control.title}
                className="rounded-md border border-[rgb(var(--court-accent-rgb)/0.16)] bg-black/22 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.24)] bg-[rgb(var(--court-accent-rgb)/0.08)] text-[var(--court-accent)]">
                    <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  </div>

                  <p className="font-michroma text-[8px] uppercase text-white lg:text-[10px]">
                    {control.title}
                  </p>
                </div>

                <p className="mt-1.5 min-h-10 font-michroma text-[7px] leading-relaxed text-white/58 lg:text-[8px]">
                  {control.description}
                </p>

                <Link
                  href={getAccountHref(control.href, isSignedIn)}
                  prefetch={isSignedIn ? undefined : false}
                  className="mt-2 inline-flex min-h-8 items-center rounded border border-white/15 bg-white/5 px-2 font-michroma text-[7px] uppercase text-white/75 transition hover:border-[rgb(var(--court-accent-rgb)/0.45)] hover:text-[var(--court-accent)] lg:text-[7px]"
                >
                  {control.action}
                </Link>
              </article>
              );
            })}
          </div>
        </section>

        <section className="mt-4 rounded-lg border border-[rgb(var(--court-accent-rgb)/0.22)] bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-3 lg:mt-6 lg:p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.28)] bg-[rgb(var(--court-accent-rgb)/0.08)] text-[var(--court-accent)]">
              <UserCog aria-hidden="true" className="h-3.5 w-3.5" />
            </div>

            <p className="font-michroma text-[8px] uppercase text-white lg:text-[10px]">
              Privacy & Transparency
            </p>
          </div>

          <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/68 lg:text-[9px]">
            StatCourt uses account data to power the features you choose to
            use. Private account information is not shown on your public profile
            unless you choose to make it visible. For privacy questions or data
            requests, visit our{" "}
            <Link
              href="/contact"
              className="text-[var(--court-accent)] transition hover:text-white"
            >
              Contact page
            </Link>
            .
          </p>

          <div className="mt-3 flex flex-wrap gap-2 font-michroma text-[7px] uppercase lg:text-[8px]">
            <Link
              href="/privacy"
              className="text-[var(--court-accent)] transition hover:text-white"
            >
              Privacy Policy
            </Link>
            <span className="text-white/30">•</span>
            <Link
              href="/terms"
              className="text-white/75 transition hover:text-white"
            >
              Terms of Service
            </Link>
            <span className="text-white/30">•</span>
            <Link
              href="/contact"
              className="text-white/75 transition hover:text-white"
            >
              Contact
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
