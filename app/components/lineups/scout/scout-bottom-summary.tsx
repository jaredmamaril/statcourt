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
      <div className="grid gap-2 border-t border-white/10 pt-3 lg:grid-cols-3 lg:gap-3 lg:pt-4">
        <div>
          <p className="font-michroma text-[8px] uppercase text-white/65 lg:text-[10px]">
            X-Factor
          </p>
          <p className="font-michroma text-[9px] lg:text-xs text-white">
            {xFactorName}
          </p>
          <p className="mt-1 font-michroma text-[8px] leading-relaxed text-white/65 lg:text-[9px]">
            {xFactorDescription}
          </p>
        </div>

        <div>
          <p className="font-michroma text-[8px] uppercase text-white/65 lg:text-[10px]">
            Similar To
          </p>
          <p className="font-michroma text-[9px] text-[var(--court-accent)] lg:text-xs">
            {similarLineup}
          </p>
          <p className="font-michroma text-[8px] leading-relaxed text-white/65 lg:text-[9px]">
            {similarToDescription}
          </p>
        </div>

        <div>
          <p className="font-michroma text-[8px] uppercase text-white/65 lg:text-[10px]">
            Court Balance
          </p>
          <p
            className="font-michroma text-[9px] lg:text-xs"
            style={{ color: courtBalanceColor }}
          >
            {courtBalance}
          </p>
          <p className="mt-1 max-w-41.25 font-michroma text-[8px] leading-relaxed text-white/65 lg:text-[9px]">
            {courtBalanceDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
