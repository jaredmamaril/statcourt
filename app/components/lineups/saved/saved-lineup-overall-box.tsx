type TopScore = {
  label: string;
  value: number;
};

type SavedLineupOverallBoxProps = {
  overall: number;
  topScore: TopScore | null;
  archetypeColor: string;
};

export function SavedLineupOverallBox({
  overall,
  topScore,
  archetypeColor,
}: SavedLineupOverallBoxProps) {
  return (
    <div
      className="rounded-md border px-2 py-1 text-center transition-all duration-200 lg:px-3 lg:py-2"
      style={{
        borderColor: `${archetypeColor}80`,
        backgroundColor: `${archetypeColor}18`,
        boxShadow: `0 0 14px ${archetypeColor}22`,
      }}
    >
      <p
        className="font-michroma text-[10px] lg:text-lg"
        style={{
          color: archetypeColor,
          textShadow: `0 0 12px ${archetypeColor}99`,
        }}
      >
        {overall.toFixed(1)}
      </p>

      <p className="font-michroma text-[7px] uppercase text-white/65 lg:text-[8px]">
        OVR
      </p>

      {topScore && (
        <p
          className="mt-0.5 font-michroma text-[7px] uppercase lg:mt-1 lg:text-[8px]"
          style={{ color: archetypeColor }}
        >
          {Math.round(topScore.value)} {topScore.label}
        </p>
      )}
    </div>
  );
}
