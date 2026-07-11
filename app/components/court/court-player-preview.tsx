import PlayerImage from "../player-image";
import { getPlayerHeadshot } from "../player-images";
import { getTeamColor, type Player } from "../court-data";

type CourtPlayerPreviewProps = {
  selectedPlayer: Player | undefined;
  fallbackColor: string;
};

export function CourtPlayerPreview({
  selectedPlayer,
  fallbackColor,
}: CourtPlayerPreviewProps) {
  const playerColor = selectedPlayer
    ? getTeamColor(selectedPlayer.team)
    : fallbackColor;

  return (
    <>
      <h1
        className="font-michroma text-[10px] font-bold brightness-125 sm:text-[16px] lg:text-[18px] text-center"
        style={{ color: playerColor }}
      >
        CHOOSE YOUR PLAYER
      </h1>

      <div
        key={selectedPlayer?.id ?? "empty-player-preview"}
        className="mt-1 flex h-26 w-26 items-center justify-center rounded-md border-2 bg-black/25 text-xs text-white/70 transition-colors duration-300 sm:h-48 sm:w-48 lg:h-64 lg:w-64"
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
