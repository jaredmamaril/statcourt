import { getTeamColor, type Player, type StatMode } from "../court-data";

type CourtComparisonHeaderProps = {
  leftPlayer?: Player;
  rightPlayer?: Player;
  isLoadingPlayers?: boolean;
  statMode: StatMode;
  onStatModeChange: (statMode: StatMode) => void;
};

export function CourtComparisonHeader({
  leftPlayer,
  rightPlayer,
  isLoadingPlayers = false,
  statMode,
  onStatModeChange,
}: CourtComparisonHeaderProps) {
  const statModeOptions: { label: string; value: StatMode }[] = [
    { label: "Career", value: "career" },
    { label: "Peak", value: "peak" },
    { label: "Current", value: "current" },
  ];

  const statModeControl = (
    <div className="mt-1.5 inline-flex rounded-md border border-white/10 bg-black/25 p-0.5">
      {statModeOptions.map((option) => {
        const isActive = statMode === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatModeChange(option.value)}
            className={`rounded border px-2 py-0.5 font-michroma text-[6px] uppercase tracking-wide transition-all duration-200 sm:px-2.5 sm:py-1 sm:text-[7px] ${
              isActive
                ? "scale-[1.04] border-[rgb(var(--court-accent-rgb)/0.55)] bg-[rgb(var(--court-accent-rgb)/0.22)] text-[var(--court-accent)] shadow-[0_0_14px_rgb(var(--court-accent-rgb)/0.28)]"
                : "border-transparent text-white/35 hover:bg-white/5 hover:text-white/70"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );

  if (isLoadingPlayers || !leftPlayer || !rightPlayer) {
    return (
      <div className="mx-auto w-full max-w-70 rounded-lg border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[color:color-mix(in_srgb,var(--court-panel)_82%,transparent)] px-3 py-2 text-center shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.1)] sm:w-fit sm:max-w-none sm:px-4 sm:py-2.5">
        <p className="font-michroma text-[8px] uppercase tracking-wide text-[var(--court-accent)] sm:text-[10px]">
          Court Comparison
        </p>

        <h1 className="mt-1 font-michroma text-sm uppercase text-white sm:text-lg">
          {isLoadingPlayers ? "Loading Player Profiles" : "Choose Two Players"}
        </h1>

        {statModeControl}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-70 rounded-lg border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[color:color-mix(in_srgb,var(--court-panel)_82%,transparent)] px-2 py-1.5 text-center shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.1)] sm:w-fit sm:max-w-none sm:px-4 sm:py-2.5">
      <p className="font-michroma text-[8px] uppercase tracking-wide text-[var(--court-accent)] sm:text-[10px]">
        Court Comparison
      </p>

      <h1 className="mt-0.5 flex max-w-full flex-col items-center justify-center gap-0.5 font-michroma text-[9px] uppercase text-white sm:flex-row sm:text-[15px] brightness-125">
        <span
          style={{
            color: getTeamColor(leftPlayer.team),
            textShadow: `0 0 12px ${getTeamColor(leftPlayer.team)}66`,
          }}
        >
          {leftPlayer.name}
        </span>

        <span className="px-1 text-[6px] text-white/45 sm:px-2 sm:text-[8px]">
          vs
        </span>

        <span
          style={{
            color: getTeamColor(rightPlayer.team),
            textShadow: `0 0 12px ${getTeamColor(rightPlayer.team)}66`,
          }}
        >
          {rightPlayer.name}
        </span>
      </h1>

      {statModeControl}
    </div>
  );
}
