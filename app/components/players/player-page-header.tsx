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
        <h1 className="font-michroma text-2xl font-bold tracking-wide text-[#1bc2ec]">
          PICK A PLAYER
        </h1>

        <p className="max-w-xl text-center font-michroma text-xs leading-relaxed text-white/40">
          Browse player cards, filter by team or position, view archetypes, and
          send players to the comparison court.
        </p>

        <input
          value={playerSearch}
          onChange={(e) => onPlayerSearchChange(e.target.value)}
          placeholder="Search For a Player..."
          className="w-full rounded-md border border-white/30 bg-black/40 px-4 py-2 text-center font-michroma text-sm text-white/80 outline-none placeholder:text-white/35 focus:border-white sm:w-64"
        />
      </div>

      <div className="flex items-center justify-center">
        <p className="mb-2 font-michroma text-sm font-medium tracking-wider text-white/80">
          Filters
        </p>
      </div>
    </>
  );
}
