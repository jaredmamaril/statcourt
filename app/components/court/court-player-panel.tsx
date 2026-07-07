import type { Player } from "../court-data";
import { CourtPlayerPreview } from "./court-player-preview";

type CourtPlayerPanelProps = {
  side: "left" | "right";
  selectedPlayer: Player | undefined;
  fallbackColor: string;
  selectedPlayerName: string;
  onOpenPicker: () => void;
};

export function CourtPlayerPanel({
  side,
  selectedPlayer,
  fallbackColor,
  selectedPlayerName,
  onOpenPicker,
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

        <button
          type="button"
          onClick={onOpenPicker}
          className="mt-2 flex w-64 cursor-pointer items-center justify-between rounded-md border border-white/30 bg-black/60 px-4 py-2 font-michroma text-white outline-none transition-all duration-200 hover:border-[#1bc2ec]/70 hover:bg-[#1bc2ec]/10 active:scale-[0.98]"
        >
          <span className="truncate">
            {selectedPlayerName || "Choose Player"}
          </span>
          <span className="text-[#347A99]">{"\u25BE"}</span>
        </button>
      </div>
    </div>
  );
}

