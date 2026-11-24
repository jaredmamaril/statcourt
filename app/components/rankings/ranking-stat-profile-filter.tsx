import type { PlayerStatProfileMode } from "../player-ratings";

type RankingStatProfileFilterProps = {
  isOpen: boolean;
  selectedProfile: PlayerStatProfileMode;
  onToggle: () => void;
  onSelectProfile: (profile: PlayerStatProfileMode) => void;
  // Newest season in the loaded data, e.g. "2026-27".
  currentSeasonLabel?: string | null;
  // Minimum games to be ranked in Current Season mode (computed from the data).
  currentSeasonMinGames?: number | null;
};

const statProfileLabels: Record<PlayerStatProfileMode, string> = {
  career: "Career",
  peak: "3-Year Peak",
  current: "Current Season",
};

function getProfileLabel(
  profile: PlayerStatProfileMode,
  currentSeasonLabel?: string | null,
) {
  return profile === "current" && currentSeasonLabel
    ? `${statProfileLabels.current} · ${currentSeasonLabel}`
    : statProfileLabels[profile];
}

export function RankingStatProfileFilter({
  isOpen,
  selectedProfile,
  onToggle,
  onSelectProfile,
  currentSeasonLabel,
  currentSeasonMinGames,
}: RankingStatProfileFilterProps) {
  const dropdownId = "ranking-stat-profile-menu";
  const minGamesLabel =
    selectedProfile === "current" && currentSeasonMinGames
      ? `Min. ${currentSeasonMinGames} ${currentSeasonMinGames === 1 ? "game" : "games"} played`
      : null;

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Filter rankings by stat profile"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        aria-haspopup="true"
        className="flex min-h-9 min-w-28 scale-[1.02] cursor-pointer items-center justify-between rounded-md border border-[rgb(var(--court-accent-rgb)/0.95)] bg-[color:color-mix(in_srgb,var(--court-accent)_38%,var(--court-panel-alt))] px-2 font-michroma text-[9px] text-[var(--court-accent)] ring-1 ring-[rgb(var(--court-accent-rgb)/0.45)] transition hover:border-[rgb(var(--court-accent-rgb)/0.95)] sm:min-h-8 sm:min-w-36 sm:px-3 sm:py-1 sm:text-xs"
      >
        <span className="truncate">
          {getProfileLabel(selectedProfile, currentSeasonLabel)}
        </span>

        <span className="shrink-0 text-[8px] text-[var(--court-accent)] sm:text-xs">
          {"\u25BE"}
        </span>
      </button>

      {minGamesLabel && (
        <span className="whitespace-nowrap font-michroma text-[8px] text-white/55 sm:text-[10px]">
          {minGamesLabel}
        </span>
      )}

      {isOpen && (
        <div id={dropdownId} className="absolute left-0 top-full z-80 mt-1.5 w-max min-w-32 rounded-md border border-white/20 bg-[var(--court-panel-alt)] py-1 animate-[dropdownIn_140ms_ease-out_both] sm:mt-2 sm:min-w-full">
          {(["career", "peak", "current"] as const).map((profile) => (
            <button
              key={profile}
              type="button"
              onClick={() => onSelectProfile(profile)}
              className={`block w-full cursor-pointer px-2 py-1.5 text-left font-michroma text-[9px] transition sm:px-3 sm:py-2 sm:text-xs ${
                selectedProfile === profile
                  ? "bg-[color:color-mix(in_srgb,var(--court-accent)_38%,var(--court-panel-alt))] text-[var(--court-accent)]"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              {getProfileLabel(profile, currentSeasonLabel)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

