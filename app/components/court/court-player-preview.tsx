import PlayerImage from "../player-image";
import { getPlayerHeadshot } from "../player-images";
import { teamColors } from "../court-data";
import type { Player } from "../court-data";

type CourtPlayerPreviewProps = {
  selectedPlayer: Player | undefined;
  fallbackColor: string;
};

export function CourtPlayerPreview({
  selectedPlayer,
  fallbackColor,
}: CourtPlayerPreviewProps) {
  const playerColor = selectedPlayer
    ? teamColors[selectedPlayer.team]
    : fallbackColor;

  return (
    <>
      <h1
        className="font-michroma text-xl font-bold"
        style={{ color: playerColor }}
      >
        CHOOSE YOUR PLAYER
      </h1>

      <div
        className="mt-2 flex h-64 w-64 items-center justify-center rounded-md border-2 bg-black/25 text-sm text-white/70 transition-colors duration-300"
        style={{
          borderColor: playerColor,
          boxShadow: selectedPlayer ? `0 0 18px ${playerColor}55` : undefined,
        }}
      >
        {selectedPlayer ? (
          <PlayerImage
            src={getPlayerHeadshot(selectedPlayer)}
            alt={selectedPlayer.name}
            width={200}
            height={200}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          "Player Image"
        )}
      </div>
    </>
  );
}
