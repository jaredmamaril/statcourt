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
    <div className="mt-1 grid grid-cols-2 gap-3 px-1 lg:mt-5 lg:grid-cols-3 lg:gap-4 lg:px-0">
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
            className="grid min-h-26 grid-cols-1 rounded-md border bg-black/30 p-2 text-left lg:min-h-36 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-6 lg:p-4"
            style={{
              borderColor: `${card.color}80`,
            }}
          >
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <Icon size={13} strokeWidth={2} style={{ color: card.color }} />

                <h2 className="font-michroma text-[9px] leading-tight lg:text-sm">
                  {card.title}
                </h2>
              </div>

              <p className="mt-1.5 font-michroma text-[6px] uppercase text-white/35 lg:mt-3 lg:text-[10px]">
                Featured
              </p>

              <p
                className="mt-0.5 line-clamp-1 font-michroma text-[7px] lg:mt-1 lg:text-xs"
                style={{ color: card.color }}
              >
                {featuredLineup ?? "Coming Soon"}
              </p>

              <p className="mt-1.5 font-michroma text-[6px] uppercase text-white/35 lg:mt-3 lg:text-[10px]">
                Lineups
              </p>

              <p className="mt-0.5 font-michroma text-[7px] text-white/70 lg:mt-1 lg:text-[11px]">
                {lineupCount} {lineupCount === 1 ? "Lineup" : "Lineups"}
              </p>
            </div>

            <span
              className="mt-1.5 flex h-5 cursor-pointer items-center justify-center rounded-md border px-2 font-michroma text-[8px] uppercase transition hover:brightness-150 lg:mt-0 lg:self-end lg:px-4 lg:py-4 lg:text-xs"
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
