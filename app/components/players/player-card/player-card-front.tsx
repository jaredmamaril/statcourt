import Image from "next/image";
import {
  getReadableTeamColor,
  getTeamLogo,
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
  const teamLogo = getTeamLogo(player.team);
  const teamColor = getReadableTeamColor(player.team);

  return (
    <div
      className={`absolute inset-0 h-full rounded-2xl border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-4 lg:min-h-134 lg:rounded-3xl lg:p-6 ${
        isCardFlipped ? "pointer-events-none" : "pointer-events-auto"
      } ${isCardFlipped ? "" : "animate-[cardFaceIn_180ms_ease-out_both]"}`}
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

      <div
        className="absolute -inset-20 z-10 rotate-90 bg-contain bg-center bg-no-repeat opacity-50 lg:-inset-30"
        style={{ backgroundImage: "var(--court-pattern)" }}
      />

      <div
        className="absolute top-13 right-9 z-30 lg:top-18 lg:right-14"
        style={{ color: teamColor }}
      >
        <div className="flex flex-col items-center">
          <span className="font-michroma text-xl font-bold opacity-70 lg:text-3xl">
            #{player.jerseyNumber}
          </span>

          <span className="font-michroma text-lg font-bold text-white opacity-70 lg:text-2xl">
            {player.position}
          </span>
        </div>
      </div>

      <div className="absolute top-13 left-9 z-30 opacity-70 lg:top-15 lg:left-12">
        <Image
          src={teamLogo}
          alt={`${player.team} logo`}
          width={240}
          height={240}
          className="h-16 w-16 object-contain lg:h-24 lg:w-24"
        />
      </div>

      <div className="absolute inset-0 -top-10.5 z-20 flex items-center justify-center lg:-top-18">
        <PlayerImage
          src={getPlayerHeadshot(player)}
          alt={player.name}
          width={520}
          height={380}
          className="h-56 w-56 rounded-md object-cover lg:h-84 lg:w-84"
        />
      </div>

      <div className="absolute right-0 bottom-16 left-0 z-30 flex items-center justify-center px-5 text-center lg:bottom-8 lg:px-6">
        <span className="w-full wrap-break-word font-michroma text-[14px] font-bold uppercase tracking-wide text-white lg:py-11 lg:text-xl">
          {player.name}
        </span>
      </div>
    </div>
  );
}
