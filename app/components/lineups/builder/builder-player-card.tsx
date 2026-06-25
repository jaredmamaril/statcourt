import { normalizeStat, type Position } from "../../court-data";
import PlayerImage from "../../player-image";
import { getPlayerHeadshot } from "../../player-images";
import {
  getBuilderPlayerRating,
  getBuilderPlayerRatingForPosition,
  getPositionFit,
  getPositionPenalty,
} from "./builder-position-helpers";
import { BuilderPlayerCardOverlay } from "./builder-player-card-overlay";

type Player = Parameters<typeof getBuilderPlayerRating>[0];

type BuilderPlayerCardProps = {
  player: Player;
  activeBuildPosition: Position;
  isSelected: boolean;
  onPickPlayer: (playerName: string) => void;
};

export function BuilderPlayerCard({
  player,
  activeBuildPosition,
  isSelected,
  onPickPlayer,
}: BuilderPlayerCardProps) {
  const positionFit = getPositionFit(player, activeBuildPosition);
  const positionRating = getBuilderPlayerRatingForPosition(
    player,
    activeBuildPosition,
  );
  const baseRating = getBuilderPlayerRating(player);
  const positionPenalty = getPositionPenalty(positionFit);

  const scoutStats = [
    {
      label: "Scoring",
      value: Math.round(normalizeStat(player.stats.ppg, 25)),
    },
    {
      label: "Shooting",
      value: Math.round(normalizeStat(player.stats.threePercent, 40)),
    },
    {
      label: "Playmaking",
      value: Math.round(normalizeStat(player.stats.apg, 8)),
    },
    {
      label: "Rebounding",
      value: Math.round(normalizeStat(player.stats.rpg, 11)),
    },
    {
      label: "Defense",
      value: Math.round(player.ratings.defense),
    },
    {
      label: "Star",
      value: Math.round(player.ratings.starPower),
    },
  ];

  return (
    <button
      type="button"
      onClick={() => onPickPlayer(player.name)}
      className={`group relative h-52 overflow-hidden rounded-md border bg-black/30 p-3 text-center transition hover:border-[#1bc2ec] hover:bg-[#1bc2ec]/10 ${
        isSelected
          ? "border-[#1bc2ec] bg-[#1bc2ec]/15 shadow-[0_0_18px_rgba(27,194,236,0.35)]"
          : "border-white/15"
      }`}
    >
      <PlayerImage
        src={getPlayerHeadshot(player)}
        alt={player.name}
        width={120}
        height={120}
        className="mx-auto h-20 w-20 rounded-full object-cover"
      />

      <p className="mt-1 flex h-10 items-center justify-center text-center font-michroma text-[11px] leading-4 text-white">
        {player.name}
      </p>

      <p className="font-michroma text-[9px] text-white/40">
        {player.team} • {player.position}
      </p>

      <p className="mt-1 font-michroma text-[10px] text-[#1bc2ec]">
        {positionRating.toFixed(1)} OVR
      </p>

      <p
        className={`mt-1 font-michroma text-[8px] uppercase ${
          positionFit === "natural"
            ? "text-emerald-400"
            : positionFit === "secondary"
              ? "text-[#1bc2ec]"
              : positionFit === "emergency"
                ? "text-[#EFBF04]"
                : "text-red-400"
        }`}
      >
        {positionFit === "natural"
          ? "Natural Fit"
          : positionFit === "secondary"
            ? "Secondary Fit"
            : positionFit === "emergency"
              ? "Emergency Fit"
              : "Mismatch -7"}
      </p>

      <BuilderPlayerCardOverlay
        scoutStats={scoutStats}
        baseRating={baseRating}
        positionRating={positionRating}
        positionPenalty={positionPenalty}
      />
    </button>
  );
}
