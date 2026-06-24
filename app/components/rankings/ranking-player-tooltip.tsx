import { getPlayerInsights, type Player } from "../court-data";

type RankingPlayerTooltipProps = {
  player: Player;
  ratingLabel: string;
  rating: string;
  onViewPlayer: (playerName: string) => void;
};

export function RankingPlayerTooltip({
  player,
  ratingLabel,
  rating,
  onViewPlayer,
}: RankingPlayerTooltipProps) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-full z-100 w-64 -translate-x-1/2 rounded-md border border-[#1bc2ec]/40 bg-black/95 p-3 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
      <p className="font-michroma text-[10px] font-bold text-white">
        {player.name}
      </p>

      <p className="mt-2 font-michroma text-[9px] text-[#1bc2ec]">
        {ratingLabel}: {rating}
      </p>

      <p className="mt-3 font-michroma text-[9px] uppercase text-white/50">
        Top Traits
      </p>

      <div className="mt-1 flex flex-col gap-1">
        {getPlayerInsights(player).traits.map((trait) => (
          <p
            key={trait.label}
            className="font-michroma text-[9px] text-white/70"
          >
            - {trait.label}
          </p>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onViewPlayer(player.name)}
        className="mt-3 w-full cursor-pointer rounded border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-3 py-2 font-michroma font-bold text-[12px] uppercase tracking-wide text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20"
      >
        View Full Card
      </button>
    </div>
  );
}
