import { normalizeTeamCode, teamColors, type Player } from "../../court-data";

type PlayerCardAddToCompareProps = {
  player: Player;
  compareSlots: {
    left: string | null;
    right: string | null;
  };
  onAddPlayerToCompare: (slot: "left" | "right") => void;
};

export function PlayerCardAddToCompare({
  player,
  compareSlots,
  onAddPlayerToCompare,
}: PlayerCardAddToCompareProps) {
  const teamColor = teamColors[normalizeTeamCode(player.team)];
  return (
    <div
      className="group absolute bottom-2 left-1/2 z-200 w-88 -translate-x-1/2"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="w-full cursor-pointer rounded-md border bg-black/60 px-4 py-2 font-michroma text-lg uppercase tracking-wide text-white backdrop-blur-sm transition-all duration-200 hover:brightness-250"
        style={{
          borderColor: teamColor,
        }}
      >
        Add to Compare
      </button>

      <div className="pointer-events-none absolute bottom-full left-1/2 z-210 w-full -translate-x-1/2 rounded-md border border-white/20 bg-black/90 p-3 opacity-0 transition-opacity duration-200 after:absolute after:left-0 after:top-full after:h-3 after:w-full after:content-[''] group-hover:pointer-events-auto group-hover:opacity-100">
        <p className="mb-2 text-center font-michroma text-[10px] uppercase text-white/60">
          Replace on Court
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onAddPlayerToCompare("left")}
            className="rounded border border-white/15 px-3 py-2 text-left font-michroma text-[10px] text-white/70 transition hover:border-[#1bc2ec]/60 hover:text-[#1bc2ec]"
          >
            <span className="block text-white/40">Left Player</span>
            <span>{compareSlots.left ?? "Empty"}</span>
          </button>

          <button
            type="button"
            onClick={() => onAddPlayerToCompare("right")}
            className="rounded border border-white/15 px-3 py-2 text-left font-michroma text-[10px] text-white/70 transition hover:border-[#1bc2ec]/60 hover:text-[#1bc2ec]"
          >
            <span className="block text-white/40">Right Player</span>
            <span>{compareSlots.right ?? "Empty"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
