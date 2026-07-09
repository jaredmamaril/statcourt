type ScoutReportHeaderProps = {
  scoutSummary: string;
  onClose: () => void;
};

export function ScoutReportHeader({
  scoutSummary,
  onClose,
}: ScoutReportHeaderProps) {
  return (
    <div className="relative">
      <div className="pr-12">
        <div className="-mt-2">
          <h2 className="font-michroma text-xs text-white lg:text-lg">
            Scouting Report
          </h2>

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
