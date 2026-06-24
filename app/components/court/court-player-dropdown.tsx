import type { Dispatch, RefObject, SetStateAction } from "react";
import { teamColors } from "../court-data";
import type { Player } from "../court-data";

type CourtPlayerDropdownProps = {
  dropdownRef: RefObject<HTMLDivElement | null>;
  selectedPlayerName: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  filteredPlayers: Player[];
  setPlayer: Dispatch<SetStateAction<string>>;
};

export function CourtPlayerDropdown({
  dropdownRef,
  selectedPlayerName,
  isOpen,
  setIsOpen,
  search,
  setSearch,
  filteredPlayers,
  setPlayer,
}: CourtPlayerDropdownProps) {
  return (
    <div ref={dropdownRef} className="relative mt-2 w-56">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between rounded-md border border-white/30 bg-black/60 px-4 py-2 font-michroma text-white outline-none"
      >
        <span>{selectedPlayerName || "Choose Player"}</span>
        <span className="text-[#347A99]">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-2 max-h-51 w-full overflow-y-auto rounded-md border border-white/30 bg-black/30 py-2 text-xs text-white">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Player..."
            className="mx-2 mb-2 w-[calc(100%-1rem)] rounded-md border border-white/30 bg-black/40 px-3 py-1.5 font-michroma text-white/80 placeholder:text-white/35"
          />

          {filteredPlayers.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => {
                setPlayer(
                  selectedPlayerName === player.name ? "" : player.name,
                );
                setIsOpen(false);
                setSearch("");
              }}
              className={`flex w-full cursor-pointer items-center gap-1 border px-4 py-3 text-left font-michroma text-xs transition-all duration-200 ${
                selectedPlayerName === player.name
                  ? "border-[#178aa7] bg-[#1bc2ec]/30 text-[#1bc2ec]"
                  : "border-white/10 bg-black/20 text-white/90 hover:border-white/30 hover:bg-white/5"
              }`}
            >
              <span className="block flex-1">{player.name}</span>

              <span
                className="shrink-0 rounded border px-1 py-0.5 text-[10px] text-white/80"
                style={{
                  backgroundColor: teamColors[player.team],
                  borderColor: teamColors[player.team],
                }}
              >
                {player.team}
              </span>

              <span className="shrink-0 rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] text-white/60">
                {player.position}
              </span>

              <span className="shrink-0 rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] text-white/60">
                #{player.jerseyNumber}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
