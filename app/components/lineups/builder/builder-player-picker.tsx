import type { Position } from "../../court-data";
import { normalizeStat } from "../../court-data";
import PlayerImage from "../../player-image";
import { getPlayerHeadshot } from "../../player-images";
import {
  getBuilderPlayerRating,
  getBuilderPlayerRatingForPosition,
  getPositionFit,
  getPositionPenalty,
} from "./builder-position-helpers";
import { BuilderPositionTabs } from "./builder-position-tabs";

type Player = Parameters<typeof getBuilderPlayerRating>[0];

type BuilderPlayerPickerProps = {
  lineupPositions: Position[];
  activeBuildPosition: Position;
  customLineup: Record<Position, string>;
  buildPlayerSearch: string;
  availableBuildPlayers: Player[];
  onSelectPosition: (position: Position) => void;
  onSearchChange: (value: string) => void;
  onPickPlayer: (playerName: string) => void;
};

export function BuilderPlayerPicker({
  lineupPositions,
  activeBuildPosition,
  customLineup,
  buildPlayerSearch,
  availableBuildPlayers,
  onSelectPosition,
  onSearchChange,
  onPickPlayer,
}: BuilderPlayerPickerProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <BuilderPositionTabs
        lineupPositions={lineupPositions}
        activeBuildPosition={activeBuildPosition}
        customLineup={customLineup}
        onSelectPosition={onSelectPosition}
      />

      <div className="flex justify-center">
        <input
          type="text"
          value={buildPlayerSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search Player..."
          className="w-full max-w-md rounded-md border border-white/15 bg-black/30 px-4 py-3 font-michroma text-xs text-white outline-none transition placeholder:text-white/30 focus:border-white"
        />
      </div>

      <div className="overflow-y-auto pr-2" style={{ maxHeight: "392px" }}>
        <div className="grid grid-cols-3 gap-2">
          {availableBuildPlayers.map((player) => {
            const isSelected =
              customLineup[activeBuildPosition] === player.name;
            const positionFit = getPositionFit(player, activeBuildPosition);
            const positionRating = getBuilderPlayerRatingForPosition(
              player,
              activeBuildPosition,
            );
            const baseRating = getBuilderPlayerRating(player);
            const positionPenalty = getPositionPenalty(positionFit);

            const scoutStats = [
              {
                label: "Scoring",
                value: Math.round(normalizeStat(player.stats.ppg, 25)),
              },
              {
                label: "Shooting",
                value: Math.round(normalizeStat(player.stats.threePercent, 40)),
              },
              {
                label: "Playmaking",
                value: Math.round(normalizeStat(player.stats.apg, 8)),
              },
              {
                label: "Rebounding",
                value: Math.round(normalizeStat(player.stats.rpg, 11)),
              },
              {
                label: "Defense",
                value: Math.round(player.defenseRating),
              },
              {
                label: "Star",
                value: Math.round(player.starPower),
              },
            ];

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => onPickPlayer(player.name)}
                className={`group relative h-52 overflow-hidden rounded-md border bg-black/30 p-3 text-center transition hover:border-[#1bc2ec] hover:bg-[#1bc2ec]/10 ${
                  isSelected
                    ? "border-[#1bc2ec] bg-[#1bc2ec]/15 shadow-[0_0_18px_rgba(27,194,236,0.35)]"
                    : "border-white/15"
                }`}
              >
                <PlayerImage
                  src={getPlayerHeadshot(player)}
                  alt={player.name}
                  width={120}
                  height={120}
                  className="mx-auto h-20 w-20 rounded-full object-cover"
                />

                <p className="mt-1 flex h-10 items-center justify-center text-center font-michroma text-[11px] leading-4 text-white">
                  {player.name}
                </p>

                <p className="font-michroma text-[9px] text-white/40">
                  {player.team} • {player.position}
                </p>

                <p className="mt-1 font-michroma text-[10px] text-[#1bc2ec]">
                  {positionRating.toFixed(1)} OVR
                </p>

                <p
                  className={`mt-1 font-michroma text-[8px] uppercase ${
                    positionFit === "natural"
                      ? "text-emerald-400"
                      : positionFit === "secondary"
                        ? "text-[#1bc2ec]"
                        : positionFit === "emergency"
                          ? "text-[#EFBF04]"
                          : "text-red-400"
                  }`}
                >
                  {positionFit === "natural"
                    ? "Natural Fit"
                    : positionFit === "secondary"
                      ? "Secondary Fit"
                      : positionFit === "emergency"
                        ? "Emergency Fit"
                        : "Mismatch -7"}
                </p>

                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-black/95 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div>
                    <p className="font-michroma text-[8px] uppercase text-[#1bc2ec]">
                      Scout Impact
                    </p>

                    <div className="mt-2 grid gap-1">
                      {scoutStats.map((stat) => (
                        <div
                          key={stat.label}
                          className="grid grid-cols-[45px_1fr_15px] items-center gap-2"
                        >
                          <p className="font-michroma text-[7px] text-white/45">
                            {stat.label}
                          </p>

                          <div className="ml-1 h-1 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-[#1bc2ec]"
                              style={{
                                width: `${Math.min(stat.value, 100)}%`,
                              }}
                            />
                          </div>

                          <p className="text-right font-michroma text-[7px] text-white/55">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-white/10">
                    <div>
                      <p className="font-michroma text-[7px] uppercase text-white/35">
                        Base
                      </p>
                      <p className="font-michroma text-[10px] text-white">
                        {baseRating.toFixed(1)}
                      </p>
                    </div>

                    <div>
                      <p className="font-michroma text-[7px] uppercase text-white/35">
                        Slot
                      </p>
                      <p className="font-michroma text-[10px] text-[#1bc2ec]">
                        {positionRating.toFixed(1)}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="font-michroma text-[7px] uppercase text-white/35">
                        Position Impact
                      </p>
                      <p className="font-michroma text-[9px] text-white/60">
                        {positionPenalty === 0
                          ? "No OVR rating penalty"
                          : `-${positionPenalty} OVR position penalty`}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
