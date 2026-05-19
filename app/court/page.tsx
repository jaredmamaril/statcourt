export default function Court() {
  return (
    <main className="min-h-screen text-white">
      <section className="relative flex min-h-screen items-center justify-between overflow-hidden px-10">
        {/* Court lines */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/40" />
        <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40" />
        <div className="absolute -left-50 top-1/2 h-[38rem] w-[38rem] -translate-y-1/2 rounded-full border-4 border-black" />

        {/* Left player */}
        <div className="relative z-10 w-full max-w-sm">
          <label className="mb-3 block font-michroma text-sm text-white/80">
            PLAYER ONE
          </label>

          <select className="w-full rounded-md border border-white/30 bg-black/30 px-4 py-3 text-white backdrop-blur-sm">
            <option>Choose player</option>
            <option>LeBron James</option>
            <option>Nikola Jokic</option>
            <option>Luka Doncic</option>
          </select>
        </div>

        {/* Right player */}
        <div className="relative z-10 w-full max-w-sm">
          <label className="mb-3 block font-michroma text-sm text-white/80">
            PLAYER TWO
          </label>

          <select className="w-full rounded-md border border-white/30 bg-black/30 px-4 py-3 text-white backdrop-blur-sm">
            <option>Choose player</option>
            <option>Stephen Curry</option>
            <option>Giannis Antetokounmpo</option>
            <option>Shai Gilgeous-Alexander</option>
          </select>
        </div>
      </section>
    </main>
  );
}
