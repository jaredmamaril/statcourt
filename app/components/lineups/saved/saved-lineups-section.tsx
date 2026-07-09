import type { LineupTab, SavedLineup } from "../shared/lineup-types";
import { SavedLineupsEmptyState } from "./saved-lineups-empty-state";
import { SavedLineupsToolbar } from "./saved-lineups-toolbar";
import { SavedLineupCard } from "./saved-lineup-card";

type SavedLineupsSectionProps = {
  savedLineups: SavedLineup[];
  filteredSavedLineups: SavedLineup[];
  savedLineupSearch: string;
  savedLineupSort: string;
  savedSortLabel: string;
  openSavedDropdown: string | null;
  onSearchChange: (value: string) => void;
  onToggleDropdown: () => void;
  onSelectSort: (value: string) => void;
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
  savedSortLabel,
  openSavedDropdown,
  onSearchChange,
  onToggleDropdown,
  onSelectSort,
  onSetActiveTab,
  onSetHasStartedBuilder,
  onLoadLineup,
  onScoutLineup,
  onRenameLineup,
  onDeleteLineup,
}: SavedLineupsSectionProps) {
  return (
    <section className="min-h-[calc(100vh-140px)]">
      {savedLineups.length === 0 ? (
        <SavedLineupsEmptyState
          onBuildLineup={() => {
            onSetActiveTab("builder");
            onSetHasStartedBuilder(false);
          }}
        />
      ) : (
        <div className="mt-6">
          <SavedLineupsToolbar
            savedLineupSearch={savedLineupSearch}
            savedLineupSort={savedLineupSort}
            savedSortLabel={savedSortLabel}
            openSavedDropdown={openSavedDropdown}
            savedLineupCount={savedLineups.length}
            onSearchChange={onSearchChange}
            onToggleDropdown={onToggleDropdown}
            onSelectSort={onSelectSort}
          />

          {filteredSavedLineups.length === 0 ? (
            <p className="mt-10 text-center font-michroma text-xs text-white/40">
              No saved lineups match your search.
            </p>
          ) : (
            <div className="mt-2 grid gap-4 lg:grid-cols-3">
              {filteredSavedLineups.map((lineup) => (
                <SavedLineupCard
                  key={lineup.id}
                  lineup={lineup}
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
