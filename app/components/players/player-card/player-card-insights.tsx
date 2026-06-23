import type { PlayerInsightDisplay } from "../../court-data";

type PlayerCardInsightsProps = {
  playerInsights: {
    archetype: PlayerInsightDisplay | null;
    traits: PlayerInsightDisplay[];
  };
  getInsightRarityStyles: (
    insight: PlayerInsightDisplay,
    isArchetype?: boolean,
  ) => React.CSSProperties;
  getInsightRarityLabel: (rarity: PlayerInsightDisplay["rarity"]) => string;
};

export function PlayerCardInsights({
  playerInsights,
  getInsightRarityStyles,
  getInsightRarityLabel,
}: PlayerCardInsightsProps) {
  return (
    <div className="flex w-fit flex-col items-center gap-1">
      <span className="font-michroma text-[14px] uppercase tracking-wide text-white">
        Insights
      </span>

      <span className="font-michroma text-[6px] uppercase tracking-wide text-white">
        Archetype
      </span>

      {playerInsights.archetype && (
        <div className="group relative z-100 w-fit">
          <div
            className="ml-2 w-fit rounded border px-2 py-1 text-center font-michroma text-[10px] font-bold uppercase tracking-wide"
            style={getInsightRarityStyles(playerInsights.archetype, true)}
          >
            {playerInsights.archetype.label}
          </div>

          <div className="pointer-events-none absolute left-1/2 top-full z-999 mt-2 w-56 -translate-x-1/2 rounded-md border border-[#1bc2ec]/50 bg-black/90 p-2 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <p className="font-michroma text-[10px] font-bold text-white/80">
              {playerInsights.archetype.label}
            </p>
            <p className="mt-1 font-michroma text-[9px] text-white/60">
              Tier: {getInsightRarityLabel(playerInsights.archetype.rarity)}
            </p>
            <p className="mt-1 font-michroma text-[9px] text-white/80">
              {playerInsights.archetype.description}
            </p>
          </div>
        </div>
      )}

      <span className="font-michroma text-[6px] uppercase tracking-wide text-white">
        Traits
      </span>

      <div className="flex flex-col items-center gap-1">
        {playerInsights.traits.map((trait) => (
          <span
            key={trait.label}
            className="group relative z-90 w-fit hover:z-300"
          >
            <span
              className="block w-fit rounded border px-1.5 py-0.5 font-michroma text-[10px]"
              style={getInsightRarityStyles(trait)}
            >
              {trait.label}
            </span>

            <span className="pointer-events-none absolute left-1/2 top-full z-999 mt-2 w-56 -translate-x-1/2 rounded-md border border-[#1bc2ec]/50 bg-black/90 p-2 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="block font-michroma text-[10px] font-bold text-white/80">
                {trait.label}
              </span>
              <span className="mt-1 block font-michroma text-[9px] text-white/60">
                Tier: {getInsightRarityLabel(trait.rarity)}
              </span>
              <span className="mt-1 block font-michroma text-[9px] text-white/80">
                {trait.description}
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
