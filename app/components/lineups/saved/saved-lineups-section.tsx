import type { LineupTab, SavedLineup } from "../shared/lineup-types";
import type { PlayerStatProfileMode } from "../../player-ratings";
import { SavedLineupsEmptyState } from "./saved-lineups-empty-state";
import { SavedLineupsToolbar } from "./saved-lineups-toolbar";
import { SavedLineupCard } from "./saved-lineup-card";

type SavedLineupsSectionProps = {
  savedLineups: SavedLineup[];
  filteredSavedLineups: SavedLineup[];
  savedLineupSearch: string;
  savedLineupSort: string;
  savedLineupProfileFilter: PlayerStatProfileMode | "all";
  savedSortLabel: string;
  savedProfileLabel: string;
  openSavedDropdown: string | null;
  isLoadingPlayers: boolean;
  onSearchChange: (value: string) => void;
  onToggleSortDropdown: () => void;
  onToggleProfileDropdown: () => void;
  onSelectSort: (value: string) => void;
  onSelectProfile: (value: PlayerStatProfileMode | "all") => void;
  onSetActiveTab: (tab: LineupTab) => void;
  onSetHasStartedBuilder: (value: boolean) => void;
  onLoadLineup: (lineup: SavedLineup) => void;
  onScoutLineup: (lineup: SavedLineup) => void;
  onRenameLineup: (lineup: SavedLineup) => void;
  onDeleteLineup: (lineup: SavedLineup) => void;
};

export function SavedLineupsSection({
  savedLineups,
  filteredSavedLineups,
  savedLineupSearch,
  savedLineupSort,
  savedLineupProfileFilter,
  savedSortLabel,
  savedProfileLabel,
  openSavedDropdown,
  isLoadingPlayers,
  onSearchChange,
  onToggleSortDropdown,
  onToggleProfileDropdown,
  onSelectSort,
  onSelectProfile,
  onSetActiveTab,
  onSetHasStartedBuilder,
  onLoadLineup,
  onScoutLineup,
  onRenameLineup,
  onDeleteLineup,
}: SavedLineupsSectionProps) {
  const emptyFilteredMessage =
    savedLineupProfileFilter === "peak"
      ? "No 3-Year Peak lineups saved yet."
      : savedLineupProfileFilter === "current"
        ? "No Latest Season lineups saved yet."
        : savedLineupProfileFilter === "career"
          ? "No Career lineups saved yet."
          : "No saved lineups match your search.";
  const savedProfileCounts = savedLineups.reduce(
    (counts, lineup) => {
      counts[lineup.statProfile ?? "career"] += 1;
      return counts;
    },
    {
      career: 0,
      peak: 0,
      current: 0,
    } satisfies Record<PlayerStatProfileMode, number>,
  );

  return (
    <section className="min-h-[calc(100svh-120px)] animate-[pageEnter_220ms_ease-out_both] lg:min-h-[calc(100vh-140px)]">
      {savedLineups.length === 0 ? (
        <SavedLineupsEmptyState
          onBuildLineup={() => {
            onSetActiveTab("builder");
            onSetHasStartedBuilder(false);
          }}
        />
      ) : (
        <div className="mt-3 lg:mt-6">
          <SavedLineupsToolbar
            savedLineupSearch={savedLineupSearch}
            savedLineupSort={savedLineupSort}
            savedLineupProfileFilter={savedLineupProfileFilter}
            savedSortLabel={savedSortLabel}
            savedProfileLabel={savedProfileLabel}
            openSavedDropdown={openSavedDropdown}
            savedLineupCount={savedLineups.length}
            savedProfileCounts={savedProfileCounts}
            onSearchChange={onSearchChange}
            onToggleSortDropdown={onToggleSortDropdown}
            onToggleProfileDropdown={onToggleProfileDropdown}
            onSelectSort={onSelectSort}
            onSelectProfile={onSelectProfile}
          />

          {isLoadingPlayers && (
            <p className="mt-2 text-center font-michroma text-[7px] uppercase text-[#1bc2ec]/70 lg:text-[10px]">
              Loading lineup player profiles...
            </p>
          )}

          {filteredSavedLineups.length === 0 ? (
            <p className="mt-6 text-center font-michroma text-[8px] text-white/40 lg:mt-10 lg:text-xs">
              {emptyFilteredMessage}
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-4">
              {filteredSavedLineups.map((lineup, index) => (
                <SavedLineupCard
                  key={lineup.id}
                  lineup={lineup}
                  index={index}
                  isLoadingPlayers={isLoadingPlayers}
                  onLoad={onLoadLineup}
                  onScout={onScoutLineup}
                  onRename={onRenameLineup}
                  onDelete={onDeleteLineup}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
