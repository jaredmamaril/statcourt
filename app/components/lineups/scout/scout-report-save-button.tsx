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
      className="absolute -bottom-8 right-0 rounded-md border bg-[var(--court-panel-alt)] px-3 py-2 font-michroma text-[8px] uppercase shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.25)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.1)] lg:-bottom-10.5 lg:px-5 lg:py-3 lg:text-xs"
      style={{
        color: scoutArchetypeColor,
        borderColor: scoutArchetypeColor,
      }}
    >
      Save Lineup
    </button>
  );
}
