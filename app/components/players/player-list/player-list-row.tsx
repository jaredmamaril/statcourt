import {
  getTeamColor,
  getReadableTeamColor,
  type Player,
  type SortValue,
} from "../../court-data";
import { getPlayerHeadshot } from "../../player-images";
import { getPlayerRating } from "../../player-ratings";
import type { PlayerRatingCategory } from "../../player-ratings";
import PlayerImage from "../../player-image";

function getActivePlayerStats(
  player: Player,
  selectedSkill: PlayerRatingCategory,
) {
  if (selectedSkill === "peakOverall") {
    return (
      player.statProfiles?.peak ?? player.statProfiles?.career ?? player.stats
    );
  }

  if (selectedSkill === "currentOverall") {
    return (
      player.statProfiles?.current ??
      player.statProfiles?.career ??
      player.stats
    );
  }

  return player.statProfiles?.career ?? player.stats;
}

type PlayerListRowProps = {
  player: Player;
  isSelected: boolean;
  isFavorite: boolean;
  selectedSkill: PlayerRatingCategory;
  sortBy: SortValue;
  onToggleFavorite: (playerName: string) => void;
  onSelectPlayer: (playerName: string) => void;
};

export function PlayerListRow({
  player,
  isSelected,
  isFavorite,
  selectedSkill,
  sortBy,
  onToggleFavorite,
  onSelectPlayer,
}: PlayerListRowProps) {
  const teamColor = getTeamColor(player.team);
  const readableTeamColor = getReadableTeamColor(player.team);
  const selectedRating = getPlayerRating(player, selectedSkill);
  const selectedRatingLabel =
    selectedSkill === "careerOverall"
      ? "Career OVR"
      : selectedSkill === "peakOverall"
        ? "Peak OVR"
        : selectedSkill === "currentOverall"
          ? "Latest OVR"
          : selectedSkill === "starPower"
            ? "Star"
            : selectedSkill === "careerLegacy"
              ? "Legacy"
              : selectedSkill === "defense"
                ? "Defense"
                : "Rating";
  const activeStats = getActivePlayerStats(player, selectedSkill);
  const selectedStatValue =
    sortBy && sortBy !== "first-name" && sortBy !== "last-name"
      ? activeStats[sortBy]
      : null;
  const isPercentSort =
    sortBy === "fgPercent" ||
    sortBy === "threePercent" ||
    sortBy === "ftPercent";

  return (
    <div
      key={player.id}
      className={`flex w-full items-stretch rounded-md border text-left font-michroma text-[10px] transition-all duration-200 sm:text-xs ${
        isSelected
          ? "border-[#178aa7] bg-[#1bc2ec]/10 text-[#1bc2ec]"
          : "border-white/10 bg-black/20 text-white/90 hover:border-white/30 hover:bg-white/5"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleFavorite(player.name)}
        aria-label={
          isFavorite
            ? `Remove ${player.name} from favorites`
            : `Add ${player.name} to favorites`
        }
        className={`shrink-0 cursor-pointer px-1 py-1 text-xs transition-colors duration-200 sm:px-1.5 sm:text-sm ${
          isFavorite
            ? "text-[#1bc2ec]"
            : "text-white/20 hover:text-[#1bc2ec]/60"
        }`}
      >
        {isFavorite ? "★" : "☆"}
      </button>

      <button
        type="button"
        onClick={() => onSelectPlayer(player.name)}
        className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 px-2 py-1.5 text-left font-michroma text-[10px] sm:gap-3 sm:py-2 sm:text-xs"
      >
        <PlayerImage
          src={getPlayerHeadshot(player)}
          alt={player.name}
          width={240}
          height={240}
          className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-11 sm:w-11"
        />

        <span className="min-w-0 flex-1">
          <span className="block truncate">{player.name}</span>

          <span className="mt-1 flex items-center gap-0.5 sm:gap-1.5">
            <span
              className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[6.5px] text-white/80 sm:px-1.5 sm:text-[8px]"
              style={{
                backgroundColor: teamColor,
                borderColor: teamColor,
              }}
            >
              {player.team}
            </span>

            <span className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[6.5px] text-white/60 sm:px-1.5 sm:text-[8px]">
              {player.position}
            </span>

            <span className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[6.5px] text-white/60 sm:px-1.5 sm:text-[8px]">
              #{player.jerseyNumber}
            </span>

            {selectedStatValue !== null && (
              <span className="shrink-0 rounded border border-[#1bc2ec]/30 bg-[#1bc2ec]/10 px-1.5 py-0.5 text-[10px] text-[#1bc2ec]">
                {selectedStatValue}
                {isPercentSort ? "%" : ""}
              </span>
            )}
          </span>
        </span>

        <span className="ml-auto flex w-18 shrink-0 flex-col items-end justify-center pr-1 text-right sm:w-20 sm:pr-0">
          <span
            className="block font-michroma text-[12px] leading-none sm:text-[13px]"
            style={{
              color: readableTeamColor,
              textShadow: `0 0 10px ${teamColor}88`,
            }}
          >
            {selectedRating.toFixed(1)}
          </span>

          <span className="mt-0.5 block font-michroma text-[6px] uppercase leading-none text-white/35 sm:mt-1 sm:text-[7px]">
            {selectedRatingLabel}
          </span>
        </span>
      </button>
    </div>
  );
}
