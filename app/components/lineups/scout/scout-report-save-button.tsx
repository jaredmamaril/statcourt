type ScoutReportSaveButtonProps = {
  scoutArchetypeColor: string;
  onSaveLineup: () => void;
};

export function ScoutReportSaveButton({
  scoutArchetypeColor,
  onSaveLineup,
}: ScoutReportSaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onSaveLineup}
      className="absolute -bottom-8 right-0 rounded-md border border-[#1bc2ec]/70 bg-[#07111f] px-3 py-2 font-michroma text-[8px] uppercase text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.25)] transition hover:bg-[#1bc2ec]/10 lg:-bottom-10.5 lg:px-5 lg:py-3 lg:text-xs"
      style={{
        color: scoutArchetypeColor,
        borderColor: scoutArchetypeColor,
      }}
    >
      Save Lineup
    </button>
  );
}
