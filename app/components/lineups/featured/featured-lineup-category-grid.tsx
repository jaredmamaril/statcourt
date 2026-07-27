import {
  lineupCards,
  lineupGroups,
  type LineupCategory,
  type LineupName,
} from "./featured-lineups";
import { getBestFeaturedLineup } from "./featured-lineup-helpers";

type FeaturedLineupCategoryGridProps = {
  selectedLineupCategory: LineupCategory | "";
  onSelectCategory: (
    category: LineupCategory,
    featuredLineup: LineupName | null,
  ) => void;
};

export function FeaturedLineupCategoryGrid({
  selectedLineupCategory,
  onSelectCategory,
}: FeaturedLineupCategoryGridProps) {
  return (
    <div className="mt-1 grid grid-cols-2 gap-3 px-1 lg:mt-5 lg:grid-cols-3 lg:gap-4 lg:px-0">
      {lineupCards.map((card, index) => {
        const Icon = card.Icon;
        const categoryLineups = lineupGroups[card.title];
        const featuredLineup = getBestFeaturedLineup(card.title);
        const lineupCount = categoryLineups.length;
        const isSelected = selectedLineupCategory === card.title;

        return (
          <button
            key={card.title}
            type="button"
            onClick={() => onSelectCategory(card.title, featuredLineup)}
            className={`animate-[playerListRowIn_180ms_ease-out_both] grid min-h-26 grid-cols-1 rounded-md border bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-2 text-left transition-all duration-200 active:scale-[0.98] lg:min-h-36 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-6 lg:p-4 ${
              isSelected ? "-translate-y-0.5" : "hover:-translate-y-0.5"
            }`}
            style={{
              borderColor: isSelected ? card.color : `${card.color}80`,
              backgroundColor: isSelected ? `${card.color}22` : undefined,
              boxShadow: isSelected ? `0 0 22px ${card.color}26` : undefined,
              animationDelay: `${Math.min(index, 5) * 45}ms`,
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
              className="mt-1.5 flex h-5 cursor-pointer items-center justify-center rounded-md border px-2 font-michroma text-[8px] uppercase transition group-active:scale-95 hover:brightness-150 lg:mt-0 lg:self-end lg:px-4 lg:py-4 lg:text-xs"
              style={{
                color: card.color,
                borderColor: isSelected ? card.color : `${card.color}80`,
                backgroundColor: isSelected ? `${card.color}24` : `${card.color}18`,
              }}
            >
              {isSelected ? "Viewing" : "Explore"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
