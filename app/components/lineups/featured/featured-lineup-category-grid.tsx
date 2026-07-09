import {
  lineupCards,
  lineupGroups,
  type LineupCategory,
  type LineupName,
} from "./featured-lineups";
import { getBestFeaturedLineup } from "./featured-lineup-helpers";

type FeaturedLineupCategoryGridProps = {
  onSelectCategory: (
    category: LineupCategory,
    featuredLineup: LineupName | null,
  ) => void;
};

export function FeaturedLineupCategoryGrid({
  onSelectCategory,
}: FeaturedLineupCategoryGridProps) {
  return (
    <div className="mt-1 grid grid-cols-2 gap-3 px-1 md:mt-5 md:grid-cols-3 md:gap-4 md:px-0">
      {lineupCards.map((card) => {
        const Icon = card.Icon;
        const categoryLineups = lineupGroups[card.title];
        const featuredLineup = getBestFeaturedLineup(card.title);
        const lineupCount = categoryLineups.length;

        return (
          <button
            key={card.title}
            type="button"
            onClick={() => onSelectCategory(card.title, featuredLineup)}
            className="grid min-h-26 grid-cols-1 rounded-md border bg-black/30 p-2 text-left md:min-h-36 md:grid-cols-[1fr_auto] md:items-center md:gap-6 md:p-4"
            style={{
              borderColor: `${card.color}80`,
            }}
          >
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <Icon size={13} strokeWidth={2} style={{ color: card.color }} />

                <h2 className="font-michroma text-[9px] leading-tight md:text-sm">
                  {card.title}
                </h2>
              </div>

              <p className="mt-1.5 font-michroma text-[6px] uppercase text-white/35 md:mt-3 md:text-[10px]">
                Featured
              </p>

              <p
                className="mt-0.5 line-clamp-1 font-michroma text-[7px] md:mt-1 md:text-xs"
                style={{ color: card.color }}
              >
                {featuredLineup ?? "Coming Soon"}
              </p>

              <p className="mt-1.5 font-michroma text-[6px] uppercase text-white/35 md:mt-3 md:text-[10px]">
                Lineups
              </p>

              <p className="mt-0.5 font-michroma text-[7px] text-white/70 md:mt-1 md:text-[11px]">
                {lineupCount} {lineupCount === 1 ? "Lineup" : "Lineups"}
              </p>
            </div>

            <span
              className="mt-1.5 flex h-5 cursor-pointer items-center justify-center rounded-md border px-2 font-michroma text-[8px] uppercase transition hover:brightness-150 md:mt-0 md:self-end md:px-4 md:py-4 md:text-xs"
              style={{
                color: card.color,
                borderColor: `${card.color}80`,
                backgroundColor: `${card.color}18`,
              }}
            >
              Explore
            </span>
          </button>
        );
      })}
    </div>
  );
}
