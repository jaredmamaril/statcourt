import type { PlayerStatProfileMode } from "../player-ratings";

type RankingStatProfileFilterProps = {
  isOpen: boolean;
  selectedProfile: PlayerStatProfileMode;
  onToggle: () => void;
  onSelectProfile: (profile: PlayerStatProfileMode) => void;
};

const statProfileLabels: Record<PlayerStatProfileMode, string> = {
  career: "Career",
  peak: "3-Year Peak",
  current: "Latest Season",
};

export function RankingStatProfileFilter({
  isOpen,
  selectedProfile,
  onToggle,
  onSelectProfile,
}: RankingStatProfileFilterProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-6 min-w-28 scale-[1.02] cursor-pointer items-center justify-between rounded-md border border-[rgb(var(--court-accent-rgb)/0.95)] bg-[color:color-mix(in_srgb,var(--court-accent)_38%,var(--court-panel-alt))] px-2 font-michroma text-[9px] text-[var(--court-accent)] ring-1 ring-[rgb(var(--court-accent-rgb)/0.45)] transition hover:border-[rgb(var(--court-accent-rgb)/0.95)] sm:h-auto sm:min-w-36 sm:px-3 sm:py-1 sm:text-xs"
      >
        <span className="truncate">{statProfileLabels[selectedProfile]}</span>

        <span className="shrink-0 text-[8px] text-[var(--court-accent)] sm:text-xs">
          {"\u25BE"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-80 mt-1.5 w-32 rounded-md border border-white/20 bg-[var(--court-panel-alt)] py-1 animate-[dropdownIn_140ms_ease-out_both] sm:mt-2 sm:w-full">
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
              {statProfileLabels[profile]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

