export function ArchetypeHeader() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <h1 className="font-michroma text-lg uppercase tracking-wide text-white">
        Archetypes
      </h1>

      <div className="group relative">
        <button
          type="button"
          className="cursor-help rounded border border-white/15 bg-black/30 px-2 py-1 font-michroma text-[9px] uppercase text-white/50"
        >
          Rarity
        </button>

        <div className="pointer-events-none absolute left-0 top-full z-100 mt-2 w-56 rounded-md border border-[#1bc2ec]/40 bg-black/95 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <p className="font-michroma text-[9px] text-[#EFBF04]">
            Gold - Generational
          </p>
          <p className="mt-1 font-michroma text-[9px] text-[#A855F7]">
            Purple - Historic
          </p>
          <p className="mt-1 font-michroma text-[9px] text-[#38BDF8]">
            Blue - Elite
          </p>
          <p className="mt-2 font-michroma text-[8px] leading-relaxed text-white/50">
            Rarity shows how an archetype is ranked within the StatCourt player
            identity system.
          </p>
        </div>
      </div>

      <p className="-ml-2 text-xs text-white/20">Hover over me!</p>
    </div>
  );
}
