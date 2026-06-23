import { teamColors, type Player } from "../../court-data";

type PlayerCardSimilarPanelProps = {
  similarPlayers: {
    player: Player;
    matchScore: number;
  }[];
  bestLineupFits: string[];
  getLineupFitStyles: (fit: string) => React.CSSProperties;
  onSelectSimilarPlayer: (playerName: string) => void;
};

export function PlayerCardSimilarPanel({
  similarPlayers,
  bestLineupFits,
  getLineupFitStyles,
  onSelectSimilarPlayer,
}: PlayerCardSimilarPanelProps) {
  return (
    <div className="relative z-30 flex w-40 flex-col items-center gap-0.5">
      <span className="font-michroma text-[12px] uppercase tracking-wide text-white/50">
        Similar To
      </span>
      <span className="-mt-1 font-michroma text-[6px] text-white/45">
        by Career Statistical Match
      </span>

      <div className="mt-1 flex flex-col items-center gap-0.5 brightness-125">
        {similarPlayers.map(({ player, matchScore }) => (
          <button
            key={player.id}
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectSimilarPlayer(player.name);
            }}
            className="mr-2 flex w-44 cursor-pointer items-center justify-between gap-2 rounded border px-1.5 py-0.5 font-michroma text-[9px] text-white/70 transition-all duration-150 hover:brightness-150"
            style={{
              borderColor: teamColors[player.team],
              backgroundColor: `${teamColors[player.team]}50`,
            }}
          >
            <span className="min-w-0 flex-1 truncate text-left text-white">
              {player.name}
            </span>
            <span className="shrink-0 text-white/60">{matchScore}%</span>
          </button>
        ))}
      </div>

      <div className="mt-1 flex flex-col items-center gap-0.5">
        <span className="font-michroma text-[9px] uppercase tracking-wide text-white/50">
          Best Lineup Fits
        </span>

        {bestLineupFits.map((fit) => (
          <span
            key={fit}
            className="rounded border px-1.5 py-0.5 font-michroma text-[8px] brightness-125"
            style={getLineupFitStyles(fit)}
          >
            ✓ {fit}
          </span>
        ))}
      </div>
    </div>
  );
}
