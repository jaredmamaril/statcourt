import { Camera, Database, ImageIcon } from "lucide-react";

const creditItems = [
  {
    title: "NBA Player Headshots",
    description:
      "Player headshots may be loaded from the public NBA CDN when an NBA player ID is available.",
  },
  {
    title: "Uploaded Avatars",
    description:
      "User profile avatars are uploaded by StatCourt users or provided through connected sign-in providers.",
  },
  {
    title: "Local Placeholders",
    description:
      "Fallback player silhouettes, interface imagery, and StatCourt background assets are local app assets.",
  },
];

export default function PhotoCreditsPage() {
  return (
    <main className="page-enter relative min-h-screen overflow-x-hidden px-3 py-8 text-white lg:px-6 lg:py-12">
      <section className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="rounded-lg border border-[rgb(var(--court-accent-rgb)/0.24)] bg-[color:color-mix(in_srgb,var(--court-panel)_82%,transparent)] p-4 shadow-[0_0_28px_rgba(0,0,0,0.26)] lg:p-7">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.1)] text-[var(--court-accent)] lg:h-10 lg:w-10">
              <Camera className="h-4 w-4 lg:h-5 lg:w-5" />
            </div>

            <p className="font-michroma text-[8px] uppercase text-[var(--court-accent)] lg:text-[10px]">
              StatCourt Credits
            </p>
          </div>

          <h1 className="mt-4 font-michroma text-xl uppercase leading-tight text-white lg:text-4xl">
            Photo Credits
          </h1>

          <p className="mt-3 font-michroma text-[8px] leading-relaxed text-white/48 lg:max-w-3xl lg:text-xs">
            StatCourt uses a mix of public basketball imagery, user-uploaded
            avatars, provider profile images, and local interface assets to
            support player scouting and account profiles.
          </p>
        </div>

        <div className="mt-4 grid gap-3 lg:mt-6 lg:grid-cols-3 lg:gap-4">
          {creditItems.map((item, index) => {
            const Icon =
              index === 0 ? Database : index === 1 ? ImageIcon : Camera;

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
            Rights Notice
          </p>

          <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/40 lg:text-[9px]">
            StatCourt is an independent basketball analytics project. Team,
            league, and player imagery remain the property of their respective
            owners.
          </p>
        </section>
      </section>
    </main>
  );
}
