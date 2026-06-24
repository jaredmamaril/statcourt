type ScoutReportHeaderProps = {
  scoutSummary: string;
  onClose: () => void;
};

export function ScoutReportHeader({
  scoutSummary,
  onClose,
}: ScoutReportHeaderProps) {
  return (
    <>
      <div className="pr-58">
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
        className="absolute right-5 top-4 font-michroma text-lg text-white/40 transition hover:text-red-400"
      >
        x
      </button>
    </>
  );
}
