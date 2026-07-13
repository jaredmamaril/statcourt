import {
  Database,
  Eye,
  LogOut,
  Monitor,
  Settings2,
  UserCircle,
} from "lucide-react";

const statPreferences = [
  {
    label: "Default Stat Mode",
    value: "Career",
  },
  {
    label: "Default Player View",
    value: "Cards",
  },
  {
    label: "Compare Mode",
    value: "Career Playstyle",
  },
];

export default function SettingsPage() {
  return (
    <main className="page-enter relative min-h-svh bg-background px-3 py-3 text-white lg:px-6 lg:pt-12">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{
          backgroundImage: "url('/court-pattern.svg')",
        }}
      />

      <section className="relative z-10 mx-auto max-w-4xl py-3 lg:py-10">
        <div className="mb-3 lg:mb-8">
          <p className="font-michroma text-[7px] uppercase tracking-wide text-[#1bc2ec] lg:text-[10px]">
            StatCourt Account
          </p>

          <h1 className="mt-1 font-michroma text-base uppercase text-white lg:mt-2 lg:text-3xl">
            Settings
          </h1>

          <p className="mt-1.5 max-w-xl font-michroma text-[6px] leading-relaxed text-white/45 lg:mt-3 lg:text-[10px]">
            Account preferences for your StatCourt experience.
          </p>
        </div>

        <div className="grid gap-2 lg:gap-5">
          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-2.5 shadow-[0_0_18px_rgba(0,0,0,0.25)] lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-5 lg:gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#1bc2ec]/40 bg-[#1bc2ec]/10 text-[#1bc2ec] lg:h-9 lg:w-9">
                <UserCircle className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
              </div>

              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Account
              </p>
            </div>

            <div className="grid gap-1.5 lg:grid-cols-2 lg:gap-3">
              <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4">
                <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                  Name
                </p>
                <p className="mt-1 font-michroma text-[9px] text-white lg:mt-2 lg:text-sm">
                  Tyler
                </p>
              </div>

              <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4">
                <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                  Initials
                </p>
                <p className="mt-1 font-michroma text-[9px] text-[#1bc2ec] lg:mt-2 lg:text-sm">
                  T
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-2.5 shadow-[0_0_18px_rgba(0,0,0,0.25)] lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-5 lg:gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#A855F7]/40 bg-[#A855F7]/10 text-[#A855F7] lg:h-9 lg:w-9">
                <Monitor className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
              </div>

              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Display
              </p>
            </div>

            <div className="grid gap-1.5 lg:grid-cols-2 lg:gap-3">
              <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4">
                <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                  Theme
                </p>
                <p className="mt-1 font-michroma text-[9px] text-white lg:mt-2 lg:text-sm">
                  Dark
                </p>
              </div>

              <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4">
                <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                  Interface Density
                </p>
                <p className="mt-1 font-michroma text-[9px] text-[#1bc2ec] lg:mt-2 lg:text-sm">
                  Standard
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-2.5 shadow-[0_0_18px_rgba(0,0,0,0.25)] lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-5 lg:gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#EFBF04]/40 bg-[#EFBF04]/10 text-[#EFBF04] lg:h-9 lg:w-9">
                <Settings2 className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
              </div>

              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Stat Preferences
              </p>
            </div>

            <div className="grid gap-1.5 lg:grid-cols-3 lg:gap-3">
              {statPreferences.map((item) => (
                <div
                  key={item.label}
                  className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4"
                >
                  <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                    {item.label}
                  </p>
                  <p className="mt-1 font-michroma text-[9px] text-[#1bc2ec] lg:mt-2 lg:text-sm">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-2 font-michroma text-[6px] leading-relaxed text-white/30 lg:mt-4 lg:text-[8px]">
              These controls are placeholders until account preferences are
              connected.
            </p>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-2.5 shadow-[0_0_18px_rgba(0,0,0,0.25)] lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-5 lg:gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E] lg:h-9 lg:w-9">
                <Database className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
              </div>

              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Data
              </p>
            </div>

            <div className="grid gap-1.5 lg:grid-cols-3 lg:gap-3">
              {["Saved Lineups", "Favorite Players", "Recently Viewed"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4"
                  >
                    <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                      {item}
                    </p>
                    <p className="mt-1 font-michroma text-[9px] text-white lg:mt-2 lg:text-sm">
                      0
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-2.5 lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-5 lg:gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white/60 lg:h-9 lg:w-9">
                <Eye className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
              </div>

              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Account Preview{" "}
              </p>
            </div>

            <p className="font-michroma text-[6px] leading-relaxed text-white/40 lg:text-[9px]">
              These settings are currently static. Once account storage is
              connected, your preferences and saved data will update here.
            </p>
          </section>

          <section className="rounded-lg border border-red-500/20 bg-red-950/20 p-2.5 lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-5 lg:gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-red-500/35 bg-red-500/10 text-red-300 lg:h-9 lg:w-9">
                <LogOut className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
              </div>

              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Danger Zone
              </p>
            </div>

            <p className="mb-2 font-michroma text-[6px] leading-relaxed text-white/40 lg:mb-4 lg:text-[9px]">
              Sign out of this StatCourt account preview.
            </p>

            <button
              type="button"
              className="rounded-md border border-red-500/35 bg-red-500/10 px-2.5 py-1.5 font-michroma text-[6px] uppercase text-red-300 transition hover:bg-red-500/20 hover:text-white lg:px-4 lg:py-3 lg:text-[10px]"
            >
              Sign Out
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
