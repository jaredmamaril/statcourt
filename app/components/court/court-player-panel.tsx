import type { Dispatch, RefObject, SetStateAction } from "react";
import type { Player } from "../court-data";
import { CourtPlayerPreview } from "./court-player-preview";
import { CourtPlayerDropdown } from "./court-player-dropdown";

type CourtPlayerPanelProps = {
  side: "left" | "right";
  selectedPlayer: Player | undefined;
  fallbackColor: string;
  dropdownRef: RefObject<HTMLDivElement | null>;
  selectedPlayerName: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  filteredPlayers: Player[];
  setPlayer: Dispatch<SetStateAction<string>>;
};

export function CourtPlayerPanel({
  side,
  selectedPlayer,
  fallbackColor,
  dropdownRef,
  selectedPlayerName,
  isOpen,
  setIsOpen,
  search,
  setSearch,
  filteredPlayers,
  setPlayer,
}: CourtPlayerPanelProps) {
  const sideClass =
    side === "left"
      ? "animate-[courtLeftIn_600ms_ease-out_both]"
      : "animate-[courtRightIn_600ms_ease-out_both]";

  return (
    <div className={`relative z-10 flex justify-center ${sideClass}`}>
      <div className="pointer-events-auto flex flex-col items-center">
        <CourtPlayerPreview
          selectedPlayer={selectedPlayer}
          fallbackColor={fallbackColor}
        />

        <CourtPlayerDropdown
          dropdownRef={dropdownRef}
          selectedPlayerName={selectedPlayerName}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          search={search}
          setSearch={setSearch}
          filteredPlayers={filteredPlayers}
          setPlayer={setPlayer}
        />
      </div>
    </div>
  );
}
