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
        className="flex min-w-36 cursor-pointer items-center justify-between rounded-md border border-white/20 bg-black/30 px-3 py-1 font-michroma text-xs text-white/70 transition hover:border-[#1bc2ec]/60"
      >
        <span>{statProfileLabels[selectedProfile]}</span>
        <span className="text-[#1bc2ec]">{"\u25BE"}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-80 mt-2 w-full rounded-md border border-white/20 bg-[#07111f] py-1">
          {(["career", "peak", "current"] as const).map((profile) => (
            <button
              key={profile}
              type="button"
              onClick={() => onSelectProfile(profile)}
              className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                selectedProfile === profile
                  ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
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
