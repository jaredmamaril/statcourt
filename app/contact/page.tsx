import Link from "next/link";
import { Mail, MessageSquare, Shield } from "lucide-react";

const supportEmail = "statcourt.support@gmail.com";

const contactItems = [
  {
    title: "General Contact",
    description:
      "Use this for product questions, feedback, account access issues, and general StatCourt questions.",
    value: supportEmail,
  },
  {
    title: "Privacy Questions",
    description:
      "Need help with account data or privacy settings? Start with your account controls.",
    value: "Privacy controls",
  },
  {
    title: "Reports",
    description:
      "For public profile concerns or inappropriate content, use the Report action directly on the profile page.",
    value: "Report a Profile Issue",
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
            questions, and public profile concerns.
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

                {item.value === "Privacy controls" ? (
                  <>
                    <Link
                      href="/privacy"
                      className="mt-3 inline-flex rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-2.5 py-1.5 font-michroma text-[7px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] hover:text-white lg:text-[8px]"
                    >
                      Privacy Controls
                    </Link>

                    <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/58 lg:text-[9px]">
                      If you still need assistance, contact us at{" "}
                      <a
                        href={`mailto:${supportEmail}`}
                        className="text-[var(--court-accent)] transition hover:text-white"
                      >
                        {supportEmail}
                      </a>
                      .
                    </p>
                  </>
                ) : item.value === "Report a Profile Issue" ? (
                  <p className="mt-3 font-michroma text-[7px] uppercase text-[var(--court-accent)] lg:text-[9px]">
                    Report a Profile Issue
                  </p>
                ) : (
                  <a
                    href={`mailto:${supportEmail}`}
                    className="mt-3 inline-flex font-michroma text-[7px] uppercase text-[var(--court-accent)] transition hover:text-white lg:text-[9px]"
                  >
                    {item.value}
                  </a>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
