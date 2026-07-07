import PlayerImage from "../player-image";
import { getPlayerHeadshot } from "../player-images";
import { getReadableTeamColor, type Player } from "../court-data";

type CourtPlayerPickerModalProps = {
  isOpen: boolean;
  side: "left" | "right" | null;
  players: Player[];
  search: string;
  setSearch: (value: string) => void;
  onSelectPlayer: (playerName: string) => void;
  onClose: () => void;
};

export function CourtPlayerPickerModal({
  isOpen,
  side,
  players,
  search,
  setSearch,
  onSelectPlayer,
  onClose,
}: CourtPlayerPickerModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close player picker"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 w-full max-w-4xl rounded-xl border border-[#1bc2ec]/35 bg-[#06131d]/95 p-5 shadow-[0_0_44px_rgba(27,194,236,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-michroma text-[9px] uppercase tracking-wide text-[#1bc2ec]">
              Choose Your Player
            </p>

            <h2 className="mt-1 font-michroma text-2xl uppercase text-white">
              {side === "left" ? "Left Player" : "Right Player"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="font-michroma text-2xl text-white/45 transition hover:text-white"
          >
            x
          </button>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search player..."
          className="mt-5 w-full rounded-md border border-white/15 bg-black/35 px-4 py-3 font-michroma text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#1bc2ec]/70 focus:bg-black/50"
        />

        <div className="statcourt-scroll mt-4 max-h-107.5 overflow-y-auto pr-2">
          <div className="grid gap-2 sm:grid-cols-2">
            {players.map((player) => {
              const teamColor = getReadableTeamColor(player.team);

              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => onSelectPlayer(player.name)}
                  className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-black/25 p-3 text-left transition hover:border-[#1bc2ec]/50 hover:bg-[#071827] hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] active:scale-[0.99]"
                >
                  <div
                    className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-black/30"
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
                    <p className="truncate font-michroma text-sm text-white">
                      {player.name}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 font-michroma text-[8px] uppercase">
                      <span
                        className="rounded border px-2 py-1 text-white"
                        style={{
                          backgroundColor: teamColor,
                          borderColor: teamColor,
                        }}
                      >
                        {player.team}
                      </span>

                      <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white/55">
                        {player.position}
                      </span>

                      <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white/55">
                        #{player.jerseyNumber}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {players.length === 0 && (
            <div className="rounded-lg border border-white/10 bg-black/20 p-8 text-center">
              <p className="font-michroma text-sm text-white/50">
                No players found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
