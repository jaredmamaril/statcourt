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
        className="mb-2 h-8 w-8 text-[#1bc2ec] lg:h-14 lg:w-14"
      />

      <p className="font-michroma text-[10px] text-white lg:text-lg">
        No saved lineups yet.
      </p>

      <p className="mt-1.5 max-w-56 font-michroma text-[7px] leading-relaxed text-white/40 lg:mt-3 lg:max-w-md lg:text-xs">
        Build your first team and save it after scouting.
      </p>

      <button
        type="button"
        onClick={onBuildLineup}
        className="mt-3 rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-3 py-2 font-michroma text-[7px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 lg:mt-6 lg:px-6 lg:py-3 lg:text-xs"
      >
        Build a Lineup
      </button>
    </div>
  );
}
