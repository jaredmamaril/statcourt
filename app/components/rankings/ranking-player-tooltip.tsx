import { getPlayerInsights, type Player } from "../court-data";
import type { PlayerStatProfileMode } from "../player-ratings";

type RankingPlayerTooltipProps = {
  player: Player;
  ratingLabel: string;
  rating: string;
  statProfileFilter: PlayerStatProfileMode;
  onViewPlayer: (playerName: string) => void;
};

export function RankingPlayerTooltip({
  player,
  ratingLabel,
  rating,
  statProfileFilter,
  onViewPlayer,
}: RankingPlayerTooltipProps) {
  const playerInsights = getPlayerInsights(player, statProfileFilter);

  return (
    <div className="pointer-events-none absolute left-1/2 top-full z-[999] w-44 -translate-x-1/2 rounded-md border border-[#1bc2ec]/40 bg-black/95 p-2 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 sm:w-64 sm:p-3">
      <p className="font-michroma text-[8px] font-bold text-white sm:text-[10px]">
        {player.name}
      </p>

      <p className="mt-1.5 font-michroma text-[7px] text-[#1bc2ec] sm:mt-2 sm:text-[9px]">
        {ratingLabel}: {rating}
      </p>

      <p className="mt-2 font-michroma text-[7px] uppercase text-white/50 sm:mt-3 sm:text-[9px]">
        Top Traits
      </p>

      <div className="mt-1 flex flex-col gap-0.5 sm:gap-1">
        {playerInsights.traits.map((trait) => (
          <p
            key={trait.label}
            className="font-michroma text-[7px] text-white/70 sm:text-[9px]"
          >
            - {trait.label}
          </p>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onViewPlayer(player.name)}
        className="mt-2 w-full cursor-pointer rounded border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-2 py-1.5 font-michroma text-[8px] font-bold uppercase tracking-wide text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 sm:mt-3 sm:px-3 sm:py-2 sm:text-[12px]"
      >
        View Full Card
      </button>
    </div>
  );
}
