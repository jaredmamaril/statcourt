import Link from "next/link";
import { FileText } from "lucide-react";

const termsItems = [
  {
    title: "Using StatCourt",
    paragraphs: [
      "StatCourt is designed for basketball analysis, lineup building, player comparisons, and sharing basketball insights.",
      "By using StatCourt, you agree to use the platform responsibly and lawfully, keep your account information secure, avoid attempting to access other users' accounts or data, and avoid disrupting or abusing StatCourt services.",
    ],
  },
  {
    title: "Your Account",
    paragraphs: [
      "Your StatCourt account allows you to save and manage personalized basketball experiences, including saved lineups, favorite players, player activity history, profile preferences, and public profile settings.",
      "You are responsible for maintaining access to your account and keeping your sign-in information secure.",
    ],
  },
  {
    title: "Saved Data & Privacy",
    paragraphs: [
      "Your saved content belongs to your account and can be managed through StatCourt settings.",
      "You control what information appears publicly, including profile visibility, favorite players, public saved lineups, and shared basketball activity.",
      "Private account information will not be displayed publicly unless you choose to share it.",
      "StatCourt may use aggregated analytics and performance data to improve reliability, usability, and product quality.",
    ],
  },
  {
    title: "Basketball Data & Analysis",
    paragraphs: [
      "StatCourt provides basketball statistics, ratings, archetypes, comparisons, and scouting reports for analytical and entertainment purposes.",
      "Player data and analysis features may change as StatCourt improves its models, sources, and evaluation methods.",
    ],
  },
  {
    title: "Public Profiles & Community",
    paragraphs: [
      "If you enable public profile features, other users may be able to view information you choose to share.",
      "You are responsible for the content and lineups you make public.",
    ],
  },
  {
    title: "Account Removal",
    paragraphs: [
      "You may manage or delete your account through StatCourt account settings.",
      "Deleting your account may permanently remove saved lineups, favorites, activity history, and associated account data.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="page-enter relative min-h-screen overflow-x-hidden px-3 py-8 text-white lg:px-6 lg:py-12">
      <section className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="rounded-lg border border-[rgb(var(--court-accent-rgb)/0.24)] bg-[color:color-mix(in_srgb,var(--court-panel)_82%,transparent)] p-4 shadow-[0_0_28px_rgba(0,0,0,0.26)] lg:p-7">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.1)] text-[var(--court-accent)] lg:h-10 lg:w-10">
              <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
            </div>

            <p className="font-michroma text-[8px] uppercase text-[var(--court-accent)] lg:text-[10px]">
              StatCourt Terms
            </p>
          </div>

          <h1 className="mt-4 font-michroma text-xl uppercase leading-tight text-white lg:text-4xl">
            Terms of Service
          </h1>

          <p className="mt-3 font-michroma text-[8px] leading-relaxed text-white/48 lg:max-w-3xl lg:text-xs">
            These terms explain how StatCourt works, how accounts are managed,
            and the responsibilities of users while using the platform.
          </p>
        </div>

        <div className="mt-4 grid gap-3 lg:mt-6 lg:grid-cols-2 lg:gap-4">
          {termsItems.map((item) => (
            <section
              key={item.title}
              className="rounded-lg border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_80%,transparent)] p-3 lg:p-5"
            >
              <h2 className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                {item.title}
              </h2>

              <div className="mt-3 grid gap-2">
                {item.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="font-michroma text-[7px] leading-relaxed text-white/58 lg:text-[10px]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-4 rounded-lg border border-[rgb(var(--court-accent-rgb)/0.22)] bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-3 lg:mt-6 lg:p-5">
          <p className="font-michroma text-[8px] uppercase text-white/75 lg:text-[10px]">
            Questions
          </p>

          <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/68 lg:text-[9px]">
            For terms or account questions, visit our{" "}
            <Link
              href="/contact"
              className="text-[var(--court-accent)] hover:text-white"
            >
              Contact page
            </Link>
            .
          </p>

          <Link
            href="/privacy"
            className="mt-4 inline-flex rounded-md border border-[rgb(var(--court-accent-rgb)/0.5)] bg-[rgb(var(--court-accent-rgb)/0.16)] px-3 py-2 font-michroma text-[7px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.28)] hover:text-white lg:text-[9px]"
          >
            View Privacy Policy
          </Link>
        </section>
      </section>
    </main>
  );
}
