import type { PlayerInsightDisplay } from "../../court-data";

type PlayerCardInsightsProps = {
  openTooltip: string | null;
  onToggleTooltip: (id: string) => void;
  statModeLabel: string;
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
  openTooltip,
  onToggleTooltip,
  statModeLabel,
  playerInsights,
  getInsightRarityStyles,
  getInsightRarityLabel,
}: PlayerCardInsightsProps) {
  function toggleInsightOnTouch(event: React.PointerEvent, id: string) {
    if (event.pointerType === "mouse") return;

    event.stopPropagation();
    onToggleTooltip(id);
  }

  return (
    <div
      className={`relative flex min-w-0 flex-col items-center gap-0.5 ${
        openTooltip?.startsWith("insight-") ? "z-[9999]" : "z-40"
      }`}
    >
      <span className="font-michroma text-[8px] uppercase tracking-wide text-white/50 sm:text-[12px]">
        Insights
      </span>

      <span className="font-michroma text-[4.5px] text-center uppercase tracking-wide text-white/40 sm:text-[6px]">
        {statModeLabel} Archetype
      </span>

      {playerInsights.archetype &&
        (() => {
          const archetype = playerInsights.archetype;
          const archetypeTooltipId = `insight-archetype-${archetype.label}`;

          return (
            <div
              className={`group relative w-fit cursor-help ${
                openTooltip === archetypeTooltipId ? "z-500" : "z-100"
              }`}
              onPointerDown={(event) => {
                toggleInsightOnTouch(event, archetypeTooltipId);
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <div
                className="max-w-24 rounded border px-1 py-0.5 text-center font-michroma text-[6.5px] font-bold uppercase leading-tight tracking-wide sm:max-w-37.5 sm:px-2 sm:py-1 sm:text-[10px]"
                style={getInsightRarityStyles(archetype, true)}
              >
                {archetype.label}
              </div>

              <div
                className={`pointer-events-none absolute bottom-full left-0 z-999 mb-1.5 w-40 rounded-md border border-[#1bc2ec]/50 bg-black/95 p-2 text-center transition-opacity duration-200 sm:left-1/2 sm:w-56 sm:-translate-x-1/2 ${
                  openTooltip === archetypeTooltipId
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <p className="font-michroma text-[8px] font-bold text-white/80 sm:text-[10px]">
                  {archetype.label}
                </p>

                <p className="mt-1 font-michroma text-[7px] text-white/60 sm:text-[9px]">
                  Tier: {getInsightRarityLabel(archetype.rarity)}
                </p>

                <p className="mt-1 font-michroma text-[7px] text-white/80 sm:text-[9px]">
                  {archetype.description}
                </p>
              </div>
            </div>
          );
        })()}

      <span className="mt-0.5 font-michroma text-[5px] uppercase tracking-wide text-white/40 sm:text-[6px]">
        Traits
      </span>

      <div className="flex max-w-28 flex-col items-center gap-0.5 cursor-help sm:max-w-none sm:gap-1">
        {playerInsights.traits.map((trait) => {
          const traitTooltipId = `insight-trait-${trait.label}`;

          return (
            <span
              key={trait.label}
              className={`group relative w-fit cursor-help hover:z-300 ${
                openTooltip === traitTooltipId ? "z-500" : "z-90"
              }`}
              onPointerDown={(event) => {
                toggleInsightOnTouch(event, traitTooltipId);
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <span
                className="block max-w-24 rounded border px-1 py-0.5 text-center font-michroma text-[6.5px] leading-tight sm:max-w-37.5 sm:px-1.5 sm:text-[10px]"
                style={getInsightRarityStyles(trait)}
              >
                {trait.label}
              </span>

              <span
                className={`pointer-events-none absolute bottom-full left-0 z-999 mb-1.5 w-40 rounded-md border border-[#1bc2ec]/50 bg-black/95 p-2 text-center transition-opacity duration-200 sm:left-1/2 sm:w-56 sm:-translate-x-1/2 ${
                  openTooltip === traitTooltipId
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <span className="block font-michroma text-[8px] font-bold text-white/80 sm:text-[10px]">
                  {trait.label}
                </span>

                <span className="mt-1 block font-michroma text-[7px] text-white/60 sm:text-[9px]">
                  Tier: {getInsightRarityLabel(trait.rarity)}
                </span>

                <span className="mt-1 block font-michroma text-[7px] text-white/80 sm:text-[9px]">
                  {trait.description}
                </span>
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
