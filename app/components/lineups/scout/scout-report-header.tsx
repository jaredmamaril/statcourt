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
          <h2 className="font-michroma text-lg text-white">Scouting Report</h2>

          <div
            className="scout-section-reveal"
            style={{ animationDelay: "80ms" }}
          >
            <p className="mt-1 max-w-60 font-michroma text-[10px] leading-relaxed text-white/35">
              {scoutSummary}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute right-0 top-0 z-100 flex h-8 w-8 items-center justify-center font-michroma text-sm text-white/50 transition hover:text-red-400"
      >
        x
      </button>
    </div>
  );
}
