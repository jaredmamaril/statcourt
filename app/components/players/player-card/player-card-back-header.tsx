import { getReadableTeamColor, type Player } from "../../court-data";
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
  const teamColor = getReadableTeamColor(player.team);
  return (
    <div className="relative z-10 grid grid-cols-[42px_1fr_30px] items-center gap-1.5 px-1.5 pt-1.5 font-michroma uppercase sm:grid-cols-[52px_1fr_36px] sm:gap-2 sm:px-2 sm:pt-2 lg:grid-cols-[72px_1fr_48px] lg:gap-4 lg:px-3 lg:pt-1">
      <PlayerImage
        src={getPlayerHeadshot(player)}
        alt={player.name}
        width={240}
        height={240}
        className="h-13 w-13 rounded-md object-cover sm:h-14 sm:w-14 lg:h-24 lg:w-24"
      />

      <div className="flex min-w-0 justify-center text-center">
        <p
          className={`text-center font-bold text-white ${getPlayerNameTextClass(
            player.name,
          )}`}
        >
          {player.name}
        </p>
      </div>

      <div className="flex flex-col items-center gap-0.5 lg:gap-1">
        <p className="shrink-0 text-[9px] text-white/55 sm:text-[8px] lg:text-xs">
          {player.position}
        </p>
        <p
          className="shrink-0 text-[9px] text-white/55 sm:text-[8px] lg:text-xs"
          style={{ color: teamColor }}
        >
          {player.team}
        </p>
        <p className="shrink-0 text-[9px] text-white/55 sm:text-[8px] lg:text-xs">
          #{player.jerseyNumber}
        </p>
      </div>
    </div>
  );
}
