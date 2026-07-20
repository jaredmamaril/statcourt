import { getReadableTeamColor, type Player } from "../../court-data";

type RecentlyScoutedProps = {
  players: Player[];
  recentlyViewedPlayers: string[];
  onViewPlayer: (playerName: string) => void;
};

export function RecentlyScouted({
  players,
  recentlyViewedPlayers,
  onViewPlayer,
}: RecentlyScoutedProps) {
  if (recentlyViewedPlayers.length === 0) return null;

  return (
    <div className="panel-reveal mt-4 rounded-md border border-white/10 bg-black/10 p-3">
      <p className="mb-2 text-[8px] tracking-wide text-white/25">
        Recently Scouted
      </p>

      <div className="flex flex-col gap-2">
        {recentlyViewedPlayers.map((playerName) => {
          const recentPlayer = players.find(
            (player) => player.name === playerName,
          );

          if (!recentPlayer) return null;

          const teamColor = getReadableTeamColor(recentPlayer.team);

          return (
            <button
              key={playerName}
              type="button"
              onClick={() => onViewPlayer(playerName)}
              className="pointer-events-auto flex items-center justify-between gap-2 rounded border px-2 py-1 text-left font-michroma text-[8px] brightness-125 transition hover:scale-[1.02]"
              style={{
                borderColor: `${teamColor}50`,
                backgroundColor: `${teamColor}10`,
                boxShadow: `0 0 8px ${teamColor}22`,
              }}
            >
              <span
                className="text-[9px]"
                style={{
                  color: teamColor,
                  textShadow: `0 0 8px ${teamColor}66`,
                }}
              >
                {playerName}
              </span>

              <span
                style={{
                  color: teamColor,
                  textShadow: `0 0 8px ${teamColor}66`,
                }}
              >
                View Card
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
