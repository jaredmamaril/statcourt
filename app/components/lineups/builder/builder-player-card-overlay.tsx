type ScoutStat = {
  label: string;
  value: number;
};

type BuilderPlayerCardOverlayProps = {
  scoutStats: ScoutStat[];
  baseRating: number;
  positionRating: number;
  positionPenalty: number;
  isScoutOpen: boolean;
  onPickPlayer: () => void;
};

export function BuilderPlayerCardOverlay({
  scoutStats,
  baseRating,
  positionRating,
  positionPenalty,
  isScoutOpen,
  onPickPlayer,
}: BuilderPlayerCardOverlayProps) {
  return (
    <div
      className={`absolute inset-0 flex flex-col bg-black/95 p-1 transition-opacity duration-200 lg:p-2 ${
        isScoutOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0 group-hover:opacity-100"
      }`}
    >
      <div className="min-h-0 flex-1">
        <p className="text-center font-michroma text-[5px] uppercase text-[var(--court-accent)] lg:text-[8px]">
          Scout Impact
        </p>

        <div className="mt-0.5 grid gap-0.5 lg:mt-2 lg:gap-1">
          {scoutStats.map((stat) => (
            <div
              key={stat.label}
              className="grid grid-cols-[22px_30px_8px] items-center justify-center gap-0.5 lg:grid-cols-[45px_1fr_15px] lg:justify-stretch lg:gap-2"
            >
              <p className="truncate font-michroma text-[4.2px] text-white/45 lg:text-[7.7px]">
                {stat.label}
              </p>

              <div className="h-0.5 overflow-hidden rounded-full bg-white/10 lg:ml-1 lg:h-1">
                <div
                  className="h-full rounded-full bg-[var(--court-accent)]"
                  style={{
                    width: `${Math.min(stat.value, 100)}%`,
                  }}
                />
              </div>

              <p className="text-right font-michroma text-[4px] text-white/55 lg:text-[7px]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile button only */}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onPickPlayer();
        }}
        className="mt-1 rounded border border-[rgb(var(--court-accent-rgb)/0.7)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-1 py-0.5 font-michroma text-[5px] uppercase text-[var(--court-accent)] lg:hidden"
      >
        Draft
      </button>

      {/* Desktop details only */}
      <div className="hidden border-t border-white/10 pt-2 lg:grid lg:grid-cols-2 lg:gap-2">
        <div>
          <p className="font-michroma text-[7px] uppercase text-white/35">
            Base
          </p>
          <p className="font-michroma text-[10px] text-white">
            {baseRating.toFixed(1)}
          </p>
        </div>

        <div>
          <p className="font-michroma text-[7px] uppercase text-white/35">
            Slot
          </p>
          <p className="font-michroma text-[10px] text-[var(--court-accent)]">
            {positionRating.toFixed(1)}
          </p>
        </div>

        <div className="col-span-2">
          <p className="font-michroma text-[7px] uppercase text-white/35">
            Position Impact
          </p>
          <p className="font-michroma text-[9px] leading-tight text-white/60">
            {positionPenalty === 0
              ? "No OVR penalty"
              : `-${positionPenalty} OVR penalty`}
          </p>
        </div>
      </div>
    </div>
  );
}
