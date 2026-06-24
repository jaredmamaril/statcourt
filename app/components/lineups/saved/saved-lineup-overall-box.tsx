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
      className="rounded-md border px-3 py-2 text-center transition-all duration-200"
      style={{
        borderColor: `${archetypeColor}80`,
        backgroundColor: `${archetypeColor}18`,
        boxShadow: `0 0 14px ${archetypeColor}22`,
      }}
    >
      <p
        className="font-michroma text-lg"
        style={{
          color: archetypeColor,
          textShadow: `0 0 12px ${archetypeColor}99`,
        }}
      >
        {overall.toFixed(1)}
      </p>

      <p className="font-michroma text-[8px] uppercase text-white/40">OVR</p>

      {topScore && (
        <p
          className="mt-1 font-michroma text-[7px] uppercase"
          style={{ color: archetypeColor }}
        >
          {Math.round(topScore.value)} {topScore.label}
        </p>
      )}
    </div>
  );
}
