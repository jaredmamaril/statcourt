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

  openFilter: "era" | "position" | "team" | "archetype" | null;
  eraFilter: string;
  positionFilter: Position | "";
  teamFilter: Team | "";
  playerSearch: string;
  archetypeFilter: string;
  selectedArchetypeColor: string | undefined;
  selectedArchetypeOption: ArchetypeOptionDetail | undefined;
  archetypeOptionDetails: ArchetypeOptionDetail[];

  onOpenFilter: Dispatch<
    SetStateAction<"era" | "position" | "team" | "archetype" | null>
  >;
  onEraFilterChange: Dispatch<SetStateAction<string>>;
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
  eraFilter,
  positionFilter,
  teamFilter,
  playerSearch,
  archetypeFilter,
  selectedArchetypeColor,
  selectedArchetypeOption,
  archetypeOptionDetails,
  onOpenFilter,
  onEraFilterChange,
  onPositionFilterChange,
  onTeamFilterChange,
  onArchetypeFilterChange,
  onPlayerSearchChange,
  onViewPlayer,
}: RankingLeaderboardSectionProps) {
  return (
    <>
      <h1 className="text-center font-michroma text-lg uppercase tracking-wide text-white">
        {rankingHeading}
      </h1>

      <RankingFilterBar
        openFilter={openFilter}
        eraFilter={eraFilter}
        positionFilter={positionFilter}
        teamFilter={teamFilter}
        playerSearch={playerSearch}
        archetypeFilter={archetypeFilter}
        selectedArchetypeColor={selectedArchetypeColor}
        selectedArchetypeOption={selectedArchetypeOption}
        archetypeOptionDetails={archetypeOptionDetails}
        onOpenFilter={onOpenFilter}
        onEraFilterChange={onEraFilterChange}
        onPositionFilterChange={onPositionFilterChange}
        onTeamFilterChange={onTeamFilterChange}
        onArchetypeFilterChange={onArchetypeFilterChange}
        onPlayerSearchChange={onPlayerSearchChange}
      />

      <TopRankingCards
        players={topThreePlayers}
        ratingCategory={ratingCategory}
        ratingLabel={ratingLabel}
        onViewPlayer={onViewPlayer}
      />
    </>
  );
}
