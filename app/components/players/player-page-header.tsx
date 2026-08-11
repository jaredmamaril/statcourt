type PlayerPageHeaderProps = {
  playerSearch: string;
  onPlayerSearchChange: (value: string) => void;
};

export function PlayerPageHeader({
  playerSearch,
  onPlayerSearchChange,
}: PlayerPageHeaderProps) {
  return (
    <>
      <div className="mb-2 flex flex-col items-center justify-between gap-1">
        <h1 className="font-michroma text-lg font-bold tracking-wide text-[var(--court-accent)] sm:text-2xl">
          PICK A PLAYER
        </h1>

        <p className="max-w-sm text-center font-michroma text-[8px] leading-relaxed text-white/40 sm:max-w-xl sm:text-xs">
          Browse player cards, filter by team or position, view archetypes, and
          send players to the comparison court.
        </p>

        <label htmlFor="players-page-search" className="sr-only">
          Search players
        </label>
        <input
          id="players-page-search"
          type="search"
          value={playerSearch}
          onChange={(e) => onPlayerSearchChange(e.target.value)}
          placeholder="Search player..."
          className="mt-1 w-full max-w-65 rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] px-3 py-1.5 text-center font-michroma text-[10px] text-white/80 outline-none transition placeholder:text-white/40 focus:border-[rgb(var(--court-accent-rgb)/0.8)] focus:bg-[color:color-mix(in_srgb,var(--court-panel-alt)_94%,black)] sm:max-w-none sm:w-64 sm:px-4 sm:text-sm"
        />
      </div>

      <div className="flex items-center justify-center">
        <p className="mb-1 font-michroma text-[11px] font-medium tracking-wider text-white/80 sm:text-sm">
          Filters
        </p>
      </div>
    </>
  );
}
