type ScoutReportHeaderProps = {
  scoutSummary: string;
  statProfileLabel: string;
  onClose: () => void;
};

export function ScoutReportHeader({
  scoutSummary,
  statProfileLabel,
  onClose,
}: ScoutReportHeaderProps) {
  return (
    <div className="relative">
      <div className="pr-12">
        <div className="-mt-2">
          <h2 className="font-michroma text-xs text-white lg:text-lg">
            Scouting Report
          </h2>

          <p className="mt-1 w-fit rounded border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-2 py-0.5 font-michroma text-[6px] uppercase text-[var(--court-accent)] lg:text-[9px]">
            Based on {statProfileLabel}
          </p>

          <div
            className="scout-section-reveal"
            style={{ animationDelay: "80ms" }}
          >
            <p className="mt-1 max-w-50 font-michroma text-[7px] leading-relaxed text-white/35 lg:max-w-60 lg:text-[10px]">
              {scoutSummary}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute right-0 top-0 z-100 flex h-6 w-6 items-center justify-center font-michroma text-xs text-white/50 transition hover:text-red-400 lg:h-8 lg:w-8 lg:text-sm"
      >
        x
      </button>
    </div>
  );
}
