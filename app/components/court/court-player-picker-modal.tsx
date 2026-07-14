import PlayerImage from "../player-image";
import { getPlayerHeadshot } from "../player-images";
import { getReadableTeamColor, type Player } from "../court-data";

type CourtPlayerPickerModalProps = {
  isOpen: boolean;
  side: "left" | "right" | null;
  players: Player[];
  search: string;
  isLoadingPlayers?: boolean;
  playerLoadError?: string;
  setSearch: (value: string) => void;
  onSelectPlayer: (playerName: string) => void;
  onClose: () => void;
};

export function CourtPlayerPickerModal({
  isOpen,
  side,
  players,
  search,
  isLoadingPlayers = false,
  playerLoadError = "",
  setSearch,
  onSelectPlayer,
  onClose,
}: CourtPlayerPickerModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 px-3 pt-12 pb-4 animate-[modalBackdropIn_160ms_ease-out_both] sm:items-center sm:py-4">
      <button
        type="button"
        aria-label="Close player picker"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-[#1bc2ec]/35 bg-[#06131d]/95 p-4 shadow-[0_0_44px_rgba(27,194,236,0.22)] animate-[courtPickerModalIn_180ms_ease-out_both] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-michroma text-[8px] uppercase tracking-wide text-[#1bc2ec] sm:text-[9px]">
              Choose Your Player
            </p>

            <h2 className="mt-1 font-michroma text-lg uppercase text-white sm:text-2xl">
              {side === "left" ? "Left Player" : "Right Player"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="font-michroma text-xl text-white/45 transition hover:text-white sm:text-2xl"
          >
            ×
          </button>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          disabled={isLoadingPlayers}
          placeholder="Search player..."
          className="mt-4 w-full rounded-md border border-white/15 bg-black/35 px-3 py-2.5 font-michroma text-xs text-white outline-none transition placeholder:text-white/25 focus:border-[#1bc2ec]/70 focus:bg-black/50 disabled:cursor-wait disabled:border-white/10 disabled:text-white/25 sm:mt-5 sm:px-4 sm:py-3 sm:text-sm"
        />

        {playerLoadError && (
          <p className="mt-2 rounded border border-red-500/25 bg-red-500/10 px-2 py-1.5 font-michroma text-[7px] leading-relaxed text-red-200/75 sm:text-[8px]">
            Showing fallback player data.
          </p>
        )}

        <div className="statcourt-scroll mt-4 min-h-0 flex-1 overflow-y-auto pr-1 sm:pr-2">
          {isLoadingPlayers ? (
            <div className="rounded-lg border border-[#1bc2ec]/25 bg-black/20 p-6 text-center sm:p-8">
              <p className="font-michroma text-[8px] uppercase text-[#1bc2ec] sm:text-xs">
                Loading Players
              </p>
              <p className="mt-2 font-michroma text-[6px] text-white/35 sm:text-[8px]">
                Syncing comparison profiles...
              </p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {players.map((player) => {
                const teamColor = getReadableTeamColor(player.team);

                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => onSelectPlayer(player.name)}
                    className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-black/25 p-2.5 text-left transition hover:border-[#1bc2ec]/50 hover:bg-[#071827] hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] active:scale-[0.99] sm:gap-3 sm:p-3"
                  >
                    <div
                      className="h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-black/30 sm:h-14 sm:w-14"
                      style={{ borderColor: `${teamColor}99` }}
                    >
                      <PlayerImage
                        src={getPlayerHeadshot(player)}
                        alt={player.name}
                        width={240}
                        height={240}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-michroma text-xs text-white sm:text-sm">
                        {player.name}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 font-michroma text-[7px] uppercase sm:gap-2 sm:text-[8px]">
                        <span
                          className="rounded border px-1.5 py-0.5 text-white sm:px-2 sm:py-1"
                          style={{
                            backgroundColor: teamColor,
                            borderColor: teamColor,
                          }}
                        >
                          {player.team}
                        </span>

                        <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-white/55 sm:px-2 sm:py-1">
                          {player.position}
                        </span>

                        <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-white/55 sm:px-2 sm:py-1">
                          #{player.jerseyNumber}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!isLoadingPlayers && players.length === 0 && (
            <div className="rounded-lg border border-white/10 bg-black/20 p-6 text-center sm:p-8">
              <p className="font-michroma text-xs text-white/50 sm:text-sm">
                No players found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
