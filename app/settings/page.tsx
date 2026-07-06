import { Database, LogOut, Monitor, UserCircle } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background px-6 pt-12 text-white">
      <section className="mx-auto max-w-4xl py-10">
        <div className="mb-8">
          <p className="font-michroma text-[10px] uppercase tracking-wide text-[#1bc2ec]">
            StatCourt Account
          </p>

          <h1 className="mt-2 font-michroma text-3xl uppercase text-white">
            Settings
          </h1>

          <p className="mt-3 max-w-xl font-michroma text-[10px] leading-relaxed text-white/45">
            Account preferences for your StatCourt experience.
          </p>
        </div>

        <div className="grid gap-5">
          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-5 shadow-[0_0_18px_rgba(0,0,0,0.25)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#1bc2ec]/40 bg-[#1bc2ec]/10 text-[#1bc2ec]">
                <UserCircle className="h-4 w-4" />
              </div>

              <p className="font-michroma text-sm uppercase text-white">
                Profile
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-white/10 bg-black/20 p-4">
                <p className="font-michroma text-[8px] uppercase text-white/35">
                  Name
                </p>
                <p className="mt-2 font-michroma text-sm text-white">Tyler</p>
              </div>

              <div className="rounded-md border border-white/10 bg-black/20 p-4">
                <p className="font-michroma text-[8px] uppercase text-white/35">
                  Initials
                </p>
                <p className="mt-2 font-michroma text-sm text-[#1bc2ec]">T</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-5 shadow-[0_0_18px_rgba(0,0,0,0.25)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#A855F7]/40 bg-[#A855F7]/10 text-[#A855F7]">
                <Monitor className="h-4 w-4" />
              </div>

              <p className="font-michroma text-sm uppercase text-white">
                Display
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-white/10 bg-black/20 p-4">
                <p className="font-michroma text-[8px] uppercase text-white/35">
                  Theme
                </p>
                <p className="mt-2 font-michroma text-sm text-white">Dark</p>
              </div>

              <div className="rounded-md border border-white/10 bg-black/20 p-4">
                <p className="font-michroma text-[8px] uppercase text-white/35">
                  Default Stat Mode
                </p>
                <p className="mt-2 font-michroma text-sm text-[#1bc2ec]">
                  Career
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-5 shadow-[0_0_18px_rgba(0,0,0,0.25)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]">
                <Database className="h-4 w-4" />
              </div>

              <p className="font-michroma text-sm uppercase text-white">Data</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {["Saved Lineups", "Favorite Players", "Recently Viewed"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-md border border-white/10 bg-black/20 p-4"
                  >
                    <p className="font-michroma text-[8px] uppercase text-white/35">
                      {item}
                    </p>
                    <p className="mt-2 font-michroma text-sm text-white">0</p>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="rounded-lg border border-red-500/20 bg-red-950/10 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-red-500/35 bg-red-500/10 text-red-300">
                <LogOut className="h-4 w-4" />
              </div>

              <p className="font-michroma text-sm uppercase text-white">
                Danger Zone
              </p>
            </div>

            <button
              type="button"
              className="rounded-md border border-red-500/35 bg-red-500/10 px-4 py-3 font-michroma text-[10px] uppercase text-red-300 transition hover:bg-red-500/20 hover:text-white"
            >
              Sign Out
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
