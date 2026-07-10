import { normalizeStat, type LineupSlot } from "../../court-data";
import PlayerImage from "../../player-image";
import { getPlayerHeadshot } from "../../player-images";
import {
  getBuilderPlayerRating,
  getBuilderPlayerRatingForPosition,
  getPositionFit,
  getPositionPenalty,
  type BuilderStatProfileMode,
} from "./builder-position-helpers";
import { BuilderPlayerCardOverlay } from "./builder-player-card-overlay";

type Player = Parameters<typeof getBuilderPlayerRating>[0];

type BuilderPlayerCardProps = {
  player: Player;
  activeBuildPosition: LineupSlot;
  builderStatProfile: BuilderStatProfileMode;
  isSelected: boolean;
  isScoutOpen: boolean;
  onToggleScout: () => void;
  onPickPlayer: (playerName: string) => void;
};

export function BuilderPlayerCard({
  player,
  activeBuildPosition,
  builderStatProfile,
  isSelected,
  isScoutOpen,
  onToggleScout,
  onPickPlayer,
}: BuilderPlayerCardProps) {
  const positionFit = getPositionFit(player, activeBuildPosition);
  const positionRating = getBuilderPlayerRatingForPosition(
    player,
    activeBuildPosition,
    builderStatProfile,
  );
  const baseRating = getBuilderPlayerRating(player, builderStatProfile);
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
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        const isTouchDevice = window.matchMedia("(hover: none)").matches;

        if (isTouchDevice) {
          onToggleScout();
          return;
        }

        onPickPlayer(player.name);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();

          const isTouchDevice = window.matchMedia("(hover: none)").matches;

          if (isTouchDevice) {
            onToggleScout();
            return;
          }

          onPickPlayer(player.name);
        }
      }}
      className={`group relative h-21 overflow-hidden rounded-md border bg-black/30 p-0.75 text-center transition hover:border-[#1bc2ec] hover:bg-[#1bc2ec]/10 lg:h-52 lg:p-3 ${
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
        className="mx-auto h-7.5 w-7.5 rounded-full object-cover lg:h-20 lg:w-20"
      />

      <p className="mt-0.5 flex h-5 items-center justify-center text-center font-michroma text-[5px] leading-tight text-white lg:h-10 lg:text-[11px] lg:leading-4">
        {player.name}
      </p>

      <p className="font-michroma text-[4.5px] text-white/40 lg:text-[9px]">
        {player.team} • {player.position}
      </p>

      <p className="mt-0.5 font-michroma text-[5.4px] text-[#1bc2ec] lg:mt-1 lg:text-[10px]">
        {positionRating.toFixed(1)} OVR
      </p>

      <p
        className={`mt-0.5 font-michroma text-[4.5px] uppercase lg:mt-2 lg:text-[8px] ${
          positionFit === "natural"
            ? "text-emerald-400"
            : positionFit === "flex"
              ? "text-[#1bc2ec]"
              : positionFit === "reach"
                ? "text-yellow-400"
                : "text-red-400"
        }`}
      >
        {positionFit === "natural"
          ? "Natural Fit"
          : positionFit === "flex"
            ? `Flex Fit -${positionPenalty}`
            : positionFit === "reach"
              ? `Reach -${positionPenalty}`
              : `Mismatch -${positionPenalty}`}
      </p>

      <BuilderPlayerCardOverlay
        scoutStats={scoutStats}
        baseRating={baseRating}
        positionRating={positionRating}
        positionPenalty={positionPenalty}
        isScoutOpen={isScoutOpen}
        onPickPlayer={() => {
          onPickPlayer(player.name);
        }}
      />
    </div>
  );
}
