import { Save } from "lucide-react";

type SavedLineupsEmptyStateProps = {
  onBuildLineup: () => void;
};

export function SavedLineupsEmptyState({
  onBuildLineup,
}: SavedLineupsEmptyStateProps) {
  return (
    <div className="flex min-h-105 flex-col items-center justify-center text-center">
      <Save size={56} strokeWidth={1.5} className="mb-1 text-[#1bc2ec]" />

      <p className="font-michroma text-lg text-white">No saved lineups yet.</p>

      <p className="mt-3 max-w-md font-michroma text-xs leading-relaxed text-white/40">
        Build your first team and save it after scouting.
      </p>

      <button
        type="button"
        onClick={onBuildLineup}
        className="mt-6 rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-6 py-3 font-michroma text-xs uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20"
      >
        Build a Lineup
      </button>
    </div>
  );
}
