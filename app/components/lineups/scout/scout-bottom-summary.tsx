type ScoutBottomSummaryProps = {
  xFactorName: string;
  xFactorDescription: string;
  similarLineup: string;
  similarToDescription: string;
  courtBalance: string;
  courtBalanceDescription: string;
  courtBalanceColor: string;
};

export function ScoutBottomSummary({
  xFactorName,
  xFactorDescription,
  similarLineup,
  similarToDescription,
  courtBalance,
  courtBalanceDescription,
  courtBalanceColor,
}: ScoutBottomSummaryProps) {
  return (
    <div
      className="scout-section-reveal relative z-10"
      style={{ animationDelay: "320ms" }}
    >
      <div className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
        <div>
          <p className="font-michroma text-[10px] uppercase text-white/40">
            X-Factor
          </p>
          <p className="font-michroma text-xs text-white">{xFactorName}</p>
          <p className="mt-1 font-michroma text-[8px] leading-relaxed text-white/35">
            {xFactorDescription}
          </p>
        </div>

        <div>
          <p className="font-michroma text-[10px] uppercase text-white/40">
            Similar To
          </p>
          <p className="font-michroma text-[11px] text-[#1bc2ec]">
            {similarLineup}
          </p>
          <p className="font-michroma text-[8px] leading-relaxed text-white/35">
            {similarToDescription}
          </p>
        </div>

        <div>
          <p className="font-michroma text-[10px] uppercase text-white/40">
            Court Balance
          </p>
          <p
            className="font-michroma text-[14px]"
            style={{ color: courtBalanceColor }}
          >
            {courtBalance}
          </p>
          <p className="mt-1 max-w-41.25 font-michroma text-[8px] leading-relaxed text-white/35">
            {courtBalanceDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
