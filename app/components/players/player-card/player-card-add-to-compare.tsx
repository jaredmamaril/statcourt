import { getTeamColor, type Player } from "../../court-data";
import { useState } from "react";

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
  const teamColor = getTeamColor(player.team);
  const [isCompareMenuOpen, setIsCompareMenuOpen] = useState(false);

  function toggleCompareMenu(event: React.MouseEvent) {
    event.stopPropagation();
    setIsCompareMenuOpen((current) => !current);
  }

  return (
    <div
      className="group relative z-200 mx-auto w-full max-w-64 sm:max-w-80"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={toggleCompareMenu}
        className="w-full cursor-pointer rounded-md border bg-black/75 px-3 py-2 font-michroma text-sm uppercase tracking-wide text-white transition-all duration-200 hover:brightness-250 sm:px-4 sm:text-lg"
        style={{
          borderColor: teamColor,
        }}
      >
        Add to Compare
      </button>

      <div
        className={`absolute bottom-full left-1/2 z-210 w-full -translate-x-1/2 rounded-md border border-white/20 bg-black/95 p-2 transition-opacity duration-200 after:absolute after:left-0 after:top-full after:h-3 after:w-full after:content-[''] sm:p-3 ${
          isCompareMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
        }`}
      >
        <p className="mb-1.5 text-center font-michroma text-[8px] uppercase text-white/60 sm:mb-2 sm:text-[10px]">
          Replace on Court
        </p>

        <div className="flex flex-col gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAddPlayerToCompare("left");
              setIsCompareMenuOpen(false);
            }}
            className="rounded border border-white/15 px-2 py-1.5 text-left font-michroma text-[8px] text-white/70 transition hover:border-[rgb(var(--court-accent-rgb)/0.6)] hover:text-[var(--court-accent)] sm:px-3 sm:py-2 sm:text-[10px]"
          >
            <span className="block text-white/40">Left Player</span>
            <span className="block truncate">
              {compareSlots.left ?? "Empty"}
            </span>
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAddPlayerToCompare("right");
              setIsCompareMenuOpen(false);
            }}
            className="rounded border border-white/15 px-2 py-1.5 text-left font-michroma text-[8px] text-white/70 transition hover:border-[rgb(var(--court-accent-rgb)/0.6)] hover:text-[var(--court-accent)] sm:px-3 sm:py-2 sm:text-[10px]"
          >
            <span className="block text-white/40">Right Player</span>
            <span className="block truncate">
              {compareSlots.right ?? "Empty"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
