import { getTeamColor, type Player, type StatMode } from "../court-data";

type CourtComparisonHeaderProps = {
  leftPlayer?: Player;
  rightPlayer?: Player;
  statMode: StatMode;
  onStatModeChange: (statMode: StatMode) => void;
};

export function CourtComparisonHeader({
  leftPlayer,
  rightPlayer,
  statMode,
  onStatModeChange,
}: CourtComparisonHeaderProps) {
  const statModeOptions: { label: string; value: StatMode }[] = [
    { label: "Career", value: "career" },
    { label: "Peak", value: "peak" },
    { label: "Current", value: "current" },
  ];

  const statModeControl = (
    <div className="mt-2 inline-flex rounded-md border border-white/10 bg-black/25 p-0.5">
      {statModeOptions.map((option) => {
        const isActive = statMode === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatModeChange(option.value)}
            className={`rounded px-2.5 py-1 font-michroma text-[7px] uppercase tracking-wide transition ${
              isActive
                ? "bg-[#1bc2ec]/20 text-[#1bc2ec] shadow-[0_0_12px_rgba(27,194,236,0.18)]"
                : "text-white/35 hover:bg-white/5 hover:text-white/70"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );

  if (!leftPlayer || !rightPlayer) {
    return (
      <div className="mx-auto w-fit rounded-lg border border-[#1bc2ec]/25 bg-[#06131d]/82 px-4 py-3 text-center shadow-[0_0_20px_rgba(27,194,236,0.12)]">
        <p className="font-michroma text-[10px] uppercase tracking-wide text-[#1bc2ec]">
          Court Comparison
        </p>

        <h1 className="mt-2 font-michroma text-lg uppercase text-white">
          Choose Two Players
        </h1>

        {statModeControl}
      </div>
    );
  }

  return (
    <div className="mx-auto w-fit rounded-lg border border-[#1bc2ec]/25 bg-[#06131d]/82 px-2 py-2 text-center shadow-[0_0_20px_rgba(27,194,236,0.12)]">
      <p className="font-michroma text-[10px] uppercase tracking-wide text-[#1bc2ec]">
        Court Comparison
      </p>

      <h1 className="mt-0.5 font-michroma text-[15px] uppercase text-white">
        <span
          style={{
            color: getTeamColor(leftPlayer.team),
            textShadow: `0 0 14px ${getTeamColor(leftPlayer.team)}66`,
          }}
        >
          {leftPlayer.name}
        </span>

        <span className="px-2 text-[8px] text-white/45">vs</span>

        <span
          style={{
            color: getTeamColor(rightPlayer.team),
            textShadow: `0 0 14px ${getTeamColor(rightPlayer.team)}66`,
          }}
        >
          {rightPlayer.name}
        </span>
      </h1>

      {statModeControl}
    </div>
  );
}
