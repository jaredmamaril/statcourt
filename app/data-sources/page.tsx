import { BarChart3, Database, Gauge, Trophy } from "lucide-react";

const sourceItems = [
  {
    title: "Player Statistics",
    paragraphs: [
      "StatCourt uses basketball statistics to power player profiles, including career performance, peak seasons, and recent-season analysis.",
      "Statistics are used to generate comparisons, rankings, and player evaluations throughout the platform.",
    ],
  },
  {
    title: "Awards & Historical Data",
    paragraphs: [
      "Career achievements, awards, playoff performance, and historical context are used to provide additional player insights and legacy evaluations.",
    ],
  },
  {
    title: "StatCourt Models",
    paragraphs: [
      "Ratings, archetypes, lineup fits, and scouting summaries are calculated by StatCourt using a combination of statistical data and custom evaluation models.",
      "These ratings are designed for analysis and comparison purposes and may evolve as StatCourt improves its models and evaluation methods.",
    ],
  },
  {
    title: "Data & Model Interpretation",
    paragraphs: [
      "StatCourt aims to provide meaningful basketball analysis, but some ratings and insights are based on proprietary evaluation methods and may differ from other basketball platforms.",
    ],
  },
];

export default function DataSourcesPage() {
  return (
    <main className="page-enter relative min-h-screen overflow-x-hidden px-3 py-8 text-white lg:px-6 lg:py-12">
      <section className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="rounded-lg border border-[rgb(var(--court-accent-rgb)/0.24)] bg-[color:color-mix(in_srgb,var(--court-panel)_82%,transparent)] p-4 shadow-[0_0_28px_rgba(0,0,0,0.26)] lg:p-7">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.1)] text-[var(--court-accent)] lg:h-10 lg:w-10">
              <Database className="h-4 w-4 lg:h-5 lg:w-5" />
            </div>

            <p className="font-michroma text-[8px] uppercase text-[var(--court-accent)] lg:text-[10px]">
              StatCourt Data
            </p>
          </div>

          <h1 className="mt-4 font-michroma text-xl uppercase leading-tight text-white lg:text-4xl">
            Data Sources
          </h1>

          <p className="mt-3 font-michroma text-[8px] leading-relaxed text-white/48 lg:max-w-3xl lg:text-xs">
            StatCourt combines public basketball data with custom analytics
            models to create player profiles, lineup evaluations, and scouting
            insights.
          </p>
        </div>

        <div className="mt-4 grid gap-3 lg:mt-6 lg:grid-cols-2 lg:gap-4">
          {sourceItems.map((item, index) => {
            const Icon =
              index === 0
                ? BarChart3
                : index === 1
                  ? Trophy
                  : index === 2
                    ? Database
                    : Gauge;

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
            );
          })}
        </div>

        <section className="mt-4 rounded-lg border border-[rgb(var(--court-accent-rgb)/0.22)] bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-3 lg:mt-6 lg:p-5">
          <h2 className="font-michroma text-[9px] uppercase text-white lg:text-sm">
            Independent Project
          </h2>

          <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/68 lg:text-[9px]">
            StatCourt is an independent basketball analytics project and is not
            affiliated with the NBA, its teams, or its players.
          </p>

          <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/68 lg:text-[9px]">
            Basketball data, trademarks, logos, and imagery belong to their
            respective owners.
          </p>
        </section>
      </section>
    </main>
  );
}
