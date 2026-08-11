import Link from "next/link";
import { FileText, ShieldCheck, Users } from "lucide-react";

const termsItems = [
  {
    title: "Account Use",
    description:
      "Use StatCourt for lawful basketball scouting, lineup building, and profile sharing. Keep your account credentials private.",
  },
  {
    title: "Saved Data",
    description:
      "Saved lineups, favorites, profile details, and activity belong to your signed-in account and can be managed from StatCourt account tools.",
  },
  {
    title: "Basketball Content",
    description:
      "Player data, ratings, archetypes, and scout reports are analytical tools and may change as the model and source data improve.",
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
            These preview terms summarize how StatCourt should be used while
            the product is being prepared for public launch. A full legal terms
            document can replace this page before production release.
          </p>
        </div>

        <div className="mt-4 grid gap-3 lg:mt-6 lg:grid-cols-3 lg:gap-4">
          {termsItems.map((item, index) => {
            const Icon = index === 0 ? Users : index === 1 ? ShieldCheck : FileText;

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

        <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 lg:mt-6 lg:p-5">
          <p className="font-michroma text-[8px] uppercase text-white/35 lg:text-[10px]">
            Questions
          </p>

          <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/40 lg:text-[9px]">
            Contact{" "}
            <a
              href="mailto:contact@statcourt.com"
              className="text-[var(--court-accent)] hover:text-white"
            >
              contact@statcourt.com
            </a>{" "}
            with terms or account questions.
          </p>

          <Link
            href="/privacy"
            className="mt-4 inline-flex rounded-md border border-[rgb(var(--court-accent-rgb)/0.4)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-3 py-2 font-michroma text-[7px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] hover:text-white lg:text-[9px]"
          >
            View Privacy
          </Link>
        </section>
      </section>
    </main>
  );
}
