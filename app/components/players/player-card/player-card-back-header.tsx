import { teamColors, type Player } from "../../court-data";
import { getPlayerHeadshot } from "../../player-images";
import PlayerImage from "../../player-image";

type PlayerCardBackHeaderProps = {
  player: Player;
  getPlayerNameTextClass: (name: string) => string;
};

export function PlayerCardBackHeader({
  player,
  getPlayerNameTextClass,
}: PlayerCardBackHeaderProps) {
  return (
    <div className="relative z-10 grid grid-cols-[88px_1fr_52px] items-center gap-4 px-3 pt-1 font-michroma uppercase">
      <PlayerImage
        src={getPlayerHeadshot(player)}
        alt={player.name}
        width={240}
        height={240}
        className="h-24 w-24 rounded-md object-cover"
      />

      <div className="flex min-w-0 justify-center text-center">
        <p
          className={`line-clamp-2 text-center font-bold text-white ${getPlayerNameTextClass(
            player.name,
          )}`}
        >
          {player.name}
        </p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="shrink-0 text-xs text-white/55">{player.position}</p>
        <p
          className="shrink-0 text-xs text-white/55"
          style={{ color: teamColors[player.team] }}
        >
          {player.team}
        </p>
        <p className="shrink-0 text-xs text-white/55">#{player.jerseyNumber}</p>
      </div>
    </div>
  );
}
