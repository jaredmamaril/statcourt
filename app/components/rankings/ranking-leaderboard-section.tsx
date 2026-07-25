import type { Dispatch, SetStateAction } from "react";
import type { PlayerRatingCategory } from "../player-ratings";
import type { Player, Team, Position } from "../court-data";
import { RankingFilterBar } from "./ranking-filter-bar";
import { TopRankingCards } from "./top-ranking-cards";
import type { DefaultPlayerView } from "../../lib/use-user-settings";
import { RankingRatingFormulaTooltip } from "./ranking-rating-formula-tooltip";

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

  openFilter: "profile" | "position" | "team" | "archetype" | "view" | null;
  statProfileFilter: "career" | "peak" | "current";
  positionFilter: Position | "";
  teamFilter: Team | "";
  playerSearch: string;
  archetypeFilter: string;
  displayView: DefaultPlayerView;
  selectedArchetypeColor: string | undefined;
  selectedArchetypeOption: ArchetypeOptionDetail | undefined;
  archetypeOptionDetails: ArchetypeOptionDetail[];

  onOpenFilter: Dispatch<
    SetStateAction<
      "profile" | "position" | "team" | "archetype" | "view" | null
    >
  >;
  onStatProfileFilterChange: (value: "career" | "peak" | "current") => void;
  onPositionFilterChange: Dispatch<SetStateAction<Position | "">>;
  onTeamFilterChange: Dispatch<SetStateAction<Team | "">>;
  onArchetypeFilterChange: Dispatch<SetStateAction<string>>;
  onDisplayViewChange: (value: DefaultPlayerView) => void;
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
  displayView,
  selectedArchetypeColor,
  selectedArchetypeOption,
  archetypeOptionDetails,
  onOpenFilter,
  onStatProfileFilterChange,
  onPositionFilterChange,
  onTeamFilterChange,
  onArchetypeFilterChange,
  onDisplayViewChange,
  onPlayerSearchChange,
  onViewPlayer,
}: RankingLeaderboardSectionProps) {
  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-center font-michroma text-[17px] uppercase tracking-wide text-white sm:text-xl lg:text-2xl">
          {rankingHeading}
        </h1>

        <RankingRatingFormulaTooltip
          ratingCategory={ratingCategory}
          statProfileFilter={statProfileFilter}
        />
      </div>

      <RankingFilterBar
        openFilter={openFilter}
        statProfileFilter={statProfileFilter}
        positionFilter={positionFilter}
        teamFilter={teamFilter}
        playerSearch={playerSearch}
        archetypeFilter={archetypeFilter}
        displayView={displayView}
        selectedArchetypeColor={selectedArchetypeColor}
        selectedArchetypeOption={selectedArchetypeOption}
        archetypeOptionDetails={archetypeOptionDetails}
        onOpenFilter={onOpenFilter}
        onStatProfileFilterChange={onStatProfileFilterChange}
        onPositionFilterChange={onPositionFilterChange}
        onTeamFilterChange={onTeamFilterChange}
        onArchetypeFilterChange={onArchetypeFilterChange}
        onDisplayViewChange={onDisplayViewChange}
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

