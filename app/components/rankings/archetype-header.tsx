export function ArchetypeHeader() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3">
      <h1 className="font-michroma text-sm uppercase tracking-wide text-white lg:text-lg">
        Archetypes
      </h1>

      <div className="group relative">
        <button
          type="button"
          className="cursor-help rounded border border-white/15 bg-black/30 px-2 py-1 font-michroma text-[8px] uppercase text-white/50 lg:text-[9px]"
        >
          Rarity
        </button>

        <div className="pointer-events-none absolute left-1/2 top-full z-100 mt-2 w-46 -translate-x-1/2 rounded-md border border-[#1bc2ec]/40 bg-black/95 p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 lg:left-0 lg:w-56 lg:translate-x-0 lg:p-3">
          <p className="font-michroma text-[8px] text-[#EFBF04]">
            Gold - Generational
          </p>
          <p className="mt-1 font-michroma text-[8px] text-[#A855F7]">
            Purple - Historic
          </p>
          <p className="mt-1 font-michroma text-[8px] text-[#38BDF8]">
            Blue - Elite
          </p>
          <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/50">
            Rarity shows how an archetype is ranked within the StatCourt player
            identity system.
          </p>
        </div>
      </div>

      <p className="text-[9px] text-white/20 lg:-ml-2 lg:text-xs">
        <span className="lg:hidden inline">Tap me!</span>
        <span className="hidden lg:inline">Hover over me!</span>
      </p>
    </div>
  );
}
