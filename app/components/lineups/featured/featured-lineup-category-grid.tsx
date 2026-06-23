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
    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
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
            className="grid min-h-36 grid-cols-[1fr_auto] items-center gap-6 rounded-md border bg-black/30 p-4 text-left"
            style={{
              borderColor: `${card.color}80`,
            }}
          >
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <Icon size={20} strokeWidth={2} style={{ color: card.color }} />

                <h2 className="font-michroma text-sm">{card.title}</h2>
              </div>

              <p className="mt-3 font-michroma text-[10px] uppercase text-white/35">
                Featured
              </p>

              <p
                className="mt-1 font-michroma text-xs"
                style={{ color: card.color }}
              >
                {featuredLineup ?? "Coming Soon"}
              </p>

              <p className="mt-3 font-michroma text-[10px] uppercase text-white/35">
                Lineups
              </p>

              <p className="mt-1 font-michroma text-[11px] text-white/70">
                {lineupCount} {lineupCount === 1 ? "Lineup" : "Lineups"}
              </p>
            </div>

            <span
              className="cursor-pointer self-end rounded-md border px-4 py-3 font-michroma text-xs uppercase transition hover:brightness-150"
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
