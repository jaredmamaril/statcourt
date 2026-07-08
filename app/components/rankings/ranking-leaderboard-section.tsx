import type { Dispatch, SetStateAction } from "react";
import type { PlayerRatingCategory } from "../player-ratings";
import type { Player, Team, Position } from "../court-data";
import { RankingFilterBar } from "./ranking-filter-bar";
import { TopRankingCards } from "./top-ranking-cards";

type ArchetypeOptionDetail = {
  label: string;
  archetype:
    | Parameters<
        typeof import("./ranking-style-helpers").getArchetypePillStyle
      >[0]
    | null;
};

type RankingLeaderboardSectionProps = {
  rankingHeading: string;
  topThreePlayers: Player[];
  ratingCategory: PlayerRatingCategory;
  ratingLabel: string;

  openFilter: "profile" | "position" | "team" | "archetype" | null;
  statProfileFilter: "career" | "peak" | "current";
  positionFilter: Position | "";
  teamFilter: Team | "";
  playerSearch: string;
  archetypeFilter: string;
  selectedArchetypeColor: string | undefined;
  selectedArchetypeOption: ArchetypeOptionDetail | undefined;
  archetypeOptionDetails: ArchetypeOptionDetail[];

  onOpenFilter: Dispatch<
    SetStateAction<"profile" | "position" | "team" | "archetype" | null>
  >;
  onStatProfileFilterChange: (value: "career" | "peak" | "current") => void;
  onPositionFilterChange: Dispatch<SetStateAction<Position | "">>;
  onTeamFilterChange: Dispatch<SetStateAction<Team | "">>;
  onArchetypeFilterChange: Dispatch<SetStateAction<string>>;
  onPlayerSearchChange: Dispatch<SetStateAction<string>>;
  onViewPlayer: (playerName: string) => void;
};

export function RankingLeaderboardSection({
  rankingHeading,
  topThreePlayers,
  ratingCategory,
  ratingLabel,
  openFilter,
  statProfileFilter,
  positionFilter,
  teamFilter,
  playerSearch,
  archetypeFilter,
  selectedArchetypeColor,
  selectedArchetypeOption,
  archetypeOptionDetails,
  onOpenFilter,
  onStatProfileFilterChange,
  onPositionFilterChange,
  onTeamFilterChange,
  onArchetypeFilterChange,
  onPlayerSearchChange,
  onViewPlayer,
}: RankingLeaderboardSectionProps) {
  return (
    <>
      <h1 className="text-center font-michroma text-[17px] uppercase tracking-wide text-white sm:text-xl lg:text-2xl">
        {rankingHeading}
      </h1>

      <RankingFilterBar
        openFilter={openFilter}
        statProfileFilter={statProfileFilter}
        positionFilter={positionFilter}
        teamFilter={teamFilter}
        playerSearch={playerSearch}
        archetypeFilter={archetypeFilter}
        selectedArchetypeColor={selectedArchetypeColor}
        selectedArchetypeOption={selectedArchetypeOption}
        archetypeOptionDetails={archetypeOptionDetails}
        onOpenFilter={onOpenFilter}
        onStatProfileFilterChange={onStatProfileFilterChange}
        onPositionFilterChange={onPositionFilterChange}
        onTeamFilterChange={onTeamFilterChange}
        onArchetypeFilterChange={onArchetypeFilterChange}
        onPlayerSearchChange={onPlayerSearchChange}
      />

      <TopRankingCards
        players={topThreePlayers}
        ratingCategory={ratingCategory}
        ratingLabel={ratingLabel}
        statProfileFilter={statProfileFilter}
        onViewPlayer={onViewPlayer}
      />
    </>
  );
}
