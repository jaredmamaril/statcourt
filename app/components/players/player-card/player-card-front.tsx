import Image from "next/image";
import {
  normalizeTeamCode,
  teamColors,
  teamLogos,
  type Player,
} from "../../court-data";
import { getPlayerHeadshot } from "../../player-images";
import PlayerImage from "../../player-image";

type PlayerCardFrontProps = {
  player: Player;
  isCardFlipped: boolean;
};

export function PlayerCardFront({
  player,
  isCardFlipped,
}: PlayerCardFrontProps) {
  const normalizedTeam = normalizeTeamCode(player.team);
  const teamLogo = teamLogos[normalizedTeam];
  const teamColor = teamColors[normalizedTeam];
  return (
    <div
      className={`absolute inset-0 min-h-134 rounded-3xl border border-[#1bc2ec]/10 bg-black/30 p-6 ${
        isCardFlipped ? "pointer-events-none" : "pointer-events-auto"
      }`}
      style={{ backfaceVisibility: "hidden" }}
    >
      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id={`team-frame-mask-${player.id}`}>
            <rect width="100" height="100" fill="white" />
            <polygon points="8,8 82,8 92,18 92,92 18,92 8,82" fill="black" />
          </mask>
        </defs>

        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill={teamColor}
          mask={`url(#team-frame-mask-${player.id})`}
        />

        <polygon
          points="8,8 82,8 92,18 92,92 18,92 8,82"
          fill="none"
          stroke="white"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="absolute -inset-30 z-10 rotate-90 opacity-50">
        <Image
          src="/court.svg"
          alt="Court background"
          fill
          className="object-contain"
        />
      </div>

      <div
        className="absolute top-18 right-14 z-30"
        style={{ color: teamColor }}
      >
        <div className="flex flex-col items-center">
          <span className="font-michroma text-3xl font-bold opacity-70">
            #{player.jerseyNumber}
          </span>
          <span className="font-michroma text-2xl font-bold text-white opacity-70">
            {player.position}
          </span>
        </div>
      </div>

      <div className="absolute top-15 left-12 z-30 opacity-70">
        <Image
          src={teamLogo}
          alt={`${player.team} logo`}
          width={32}
          height={32}
          className="h-24 w-24 object-contain"
        />
      </div>

      <div className="absolute inset-0 z-20 flex -top-18 items-center justify-center">
        <PlayerImage
          src={getPlayerHeadshot(player)}
          alt={player.name}
          width={520}
          height={380}
          className="h-84 w-84 rounded-md object-cover"
        />
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-30 flex items-center justify-center px-6 text-center">
        <span className="w-full wrap-break-word py-11 font-michroma text-xl font-bold uppercase tracking-wide text-white">
          {player.name}
        </span>
      </div>
    </div>
  );
}
