type ScoutStat = {
  label: string;
  value: number;
};

type BuilderPlayerCardOverlayProps = {
  scoutStats: ScoutStat[];
  baseRating: number;
  positionRating: number;
  positionPenalty: number;
};

export function BuilderPlayerCardOverlay({
  scoutStats,
  baseRating,
  positionRating,
  positionPenalty,
}: BuilderPlayerCardOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-black/95 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <div>
        <p className="font-michroma text-[8px] uppercase text-[#1bc2ec]">
          Scout Impact
        </p>

        <div className="mt-2 grid gap-1">
          {scoutStats.map((stat) => (
            <div
              key={stat.label}
              className="grid grid-cols-[45px_1fr_15px] items-center gap-2"
            >
              <p className="font-michroma text-[7px] text-white/45">
                {stat.label}
              </p>

              <div className="ml-1 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#1bc2ec]"
                  style={{
                    width: `${Math.min(stat.value, 100)}%`,
                  }}
                />
              </div>

              <p className="text-right font-michroma text-[7px] text-white/55">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-white/10">
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
          <p className="font-michroma text-[10px] text-[#1bc2ec]">
            {positionRating.toFixed(1)}
          </p>
        </div>

        <div className="col-span-2">
          <p className="font-michroma text-[7px] uppercase text-white/35">
            Position Impact
          </p>
          <p className="font-michroma text-[9px] text-white/60">
            {positionPenalty === 0
              ? "No OVR rating penalty"
              : `-${positionPenalty} OVR position penalty`}
          </p>
        </div>
      </div>
    </div>
  );
}
