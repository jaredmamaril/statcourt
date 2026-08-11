import Link from "next/link";
import { Mail, MessageSquare, Shield } from "lucide-react";

const contactItems = [
  {
    title: "General Contact",
    description:
      "Use this for product questions, feedback, account questions, and StatCourt access issues.",
    value: "contact@statcourt.com",
  },
  {
    title: "Privacy Questions",
    description:
      "Use Settings and Privacy controls first, then contact StatCourt if you need account-data help.",
    value: "Privacy controls",
  },
  {
    title: "Reports",
    description:
      "Public profile reports should be sent through the Report action on the profile page.",
    value: "In-app reporting",
  },
];

export default function ContactPage() {
  return (
    <main className="page-enter relative min-h-screen overflow-x-hidden px-3 py-8 text-white lg:px-6 lg:py-12">
      <section className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="rounded-lg border border-[rgb(var(--court-accent-rgb)/0.24)] bg-[color:color-mix(in_srgb,var(--court-panel)_82%,transparent)] p-4 shadow-[0_0_28px_rgba(0,0,0,0.26)] lg:p-7">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.1)] text-[var(--court-accent)] lg:h-10 lg:w-10">
              <Mail className="h-4 w-4 lg:h-5 lg:w-5" />
            </div>

            <p className="font-michroma text-[8px] uppercase text-[var(--court-accent)] lg:text-[10px]">
              StatCourt Contact
            </p>
          </div>

          <h1 className="mt-4 font-michroma text-xl uppercase leading-tight text-white lg:text-4xl">
            Contact
          </h1>

          <p className="mt-3 font-michroma text-[8px] leading-relaxed text-white/48 lg:max-w-3xl lg:text-xs">
            Reach StatCourt for account support, product feedback, privacy
            questions, and public-profile concerns.
          </p>
        </div>

        <div className="mt-4 grid gap-3 lg:mt-6 lg:grid-cols-3 lg:gap-4">
          {contactItems.map((item, index) => {
            const Icon =
              index === 0 ? Mail : index === 1 ? Shield : MessageSquare;

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

                <p className="mt-3 font-michroma text-[7px] uppercase text-[var(--court-accent)] lg:text-[9px]">
                  {item.value}
                </p>
              </section>
            );
          })}
        </div>

        <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 lg:mt-6 lg:p-5">
          <p className="font-michroma text-[8px] uppercase text-white/35 lg:text-[10px]">
            Email
          </p>

          <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/40 lg:text-[9px]">
            Send support and feedback to{" "}
            <a
              href="mailto:contact@statcourt.com"
              className="text-[var(--court-accent)] hover:text-white"
            >
              contact@statcourt.com
            </a>
            .
          </p>

          <Link
            href="/privacy"
            className="mt-4 inline-flex rounded-md border border-[rgb(var(--court-accent-rgb)/0.4)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-3 py-2 font-michroma text-[7px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] hover:text-white lg:text-[9px]"
          >
            Privacy Controls
          </Link>
        </section>
      </section>
    </main>
  );
}
