import { Save } from "lucide-react";

type SavedLineupsEmptyStateProps = {
  onBuildLineup: () => void;
};

export function SavedLineupsEmptyState({
  onBuildLineup,
}: SavedLineupsEmptyStateProps) {
  return (
    <div className="flex min-h-55 flex-col items-center justify-center px-3 text-center lg:min-h-105 lg:px-4">
      <Save
        strokeWidth={1.5}
        className="mb-2 h-8 w-8 text-[var(--court-accent)] lg:h-14 lg:w-14"
      />

      <p className="font-michroma text-[10px] text-white lg:text-lg">
        No saved lineups yet.
      </p>

      <p className="mt-1.5 max-w-56 font-michroma text-[8px] leading-relaxed text-white/65 lg:mt-3 lg:max-w-md lg:text-xs">
        Build your first team and save it after scouting.
      </p>

      <button
        type="button"
        onClick={onBuildLineup}
        className="mt-3 rounded-md border border-[rgb(var(--court-accent-rgb)/0.7)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-3 py-2 font-michroma text-[7px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] lg:mt-6 lg:px-6 lg:py-3 lg:text-xs"
      >
        Build a Lineup
      </button>
    </div>
  );
}
