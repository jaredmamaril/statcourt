import Image from "next/image";
import {
  positions,
  teams,
  teamColors,
  teamLogos,
  type Position,
  type Team,
} from "../court-data";
import { getArchetypePillStyle } from "./ranking-style-helpers";

type OpenFilter = "era" | "position" | "team" | "archetype" | null;

type ArchetypeOptionDetail = {
  label: string;
  archetype: Parameters<typeof getArchetypePillStyle>[0] | null;
};

type RankingFilterBarProps = {
  openFilter: OpenFilter;
  eraFilter: string;
  positionFilter: Position | "";
  teamFilter: Team | "";
  playerSearch: string;
  archetypeFilter: string;
  selectedArchetypeColor: string | undefined;
  selectedArchetypeOption: ArchetypeOptionDetail | undefined;
  archetypeOptionDetails: ArchetypeOptionDetail[];
  onOpenFilter: (filter: OpenFilter) => void;
  onEraFilterChange: (value: string) => void;
  onPositionFilterChange: (value: Position | "") => void;
  onTeamFilterChange: (value: Team | "") => void;
  onArchetypeFilterChange: (value: string) => void;
  onPlayerSearchChange: (value: string) => void;
};

export function RankingFilterBar({
  openFilter,
  eraFilter,
  positionFilter,
  teamFilter,
  playerSearch,
  archetypeFilter,
  selectedArchetypeColor,
  selectedArchetypeOption,
  archetypeOptionDetails,
  onOpenFilter,
  onEraFilterChange,
  onPositionFilterChange,
  onTeamFilterChange,
  onArchetypeFilterChange,
  onPlayerSearchChange,
}: RankingFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
      {/* Era filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpenFilter(openFilter === "era" ? null : "era")}
          className="flex min-w-28 cursor-pointer items-center justify-between rounded-md border border-white/20 bg-black/30 px-3 py-1 font-michroma text-xs text-white/70 transition hover:border-[#1bc2ec]/60"
        >
          <span>{eraFilter === "all-time" ? "All-Time" : eraFilter}</span>
          <span className="text-[#1bc2ec]">▾</span>
        </button>

        {openFilter === "era" && (
          <div className="absolute left-0 top-full z-80 mt-2 w-full rounded-md border border-white/20 bg-[#07111f] py-1">
            <button
              type="button"
              onClick={() => {
                onEraFilterChange("all-time");
                onOpenFilter(null);
              }}
              className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                eraFilter === "all-time"
                  ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              All-Time
            </button>
          </div>
        )}
      </div>

      {/* Position filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            onOpenFilter(openFilter === "position" ? null : "position")
          }
          className={`flex cursor-pointer items-center gap-3 rounded-md border font-michroma text-xs transition ${
            positionFilter
              ? "w-18 border-[#1bc2ec] bg-[#1bc2ec]/10 px-3 py-1 text-[#1bc2ec]"
              : "w-40 border-white/20 bg-black/30 px-3 py-1 text-white/70 hover:border-white/60"
          }`}
        >
          <span className="flex-1 text-left">
            {positionFilter || "All Positions"}
          </span>
          <span className="shrink-0 text-[#1bc2ec]">▾</span>
        </button>

        {openFilter === "position" && (
          <div className="absolute left-0 top-full z-80 mt-2 max-h-80 w-34 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1">
            <button
              type="button"
              onClick={() => {
                onPositionFilterChange("");
                onOpenFilter(null);
              }}
              className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                positionFilter === ""
                  ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              All Positions
            </button>

            {positions.map((position) => (
              <button
                key={position}
                type="button"
                onClick={() => {
                  onPositionFilterChange(position);
                  onOpenFilter(null);
                }}
                className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                  positionFilter === position
                    ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                {position}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Team filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpenFilter(openFilter === "team" ? null : "team")}
          className="flex min-w-32 cursor-pointer items-center justify-between rounded-md border border-white/20 bg-black/30 px-3 py-1 font-michroma text-xs text-white/70 transition hover:border-[#1bc2ec]/60"
          style={{
            color: teamFilter ? teamColors[teamFilter] : undefined,
            borderColor: teamFilter ? teamColors[teamFilter] : undefined,
          }}
        >
          <span className="flex items-center gap-2">
            {teamFilter && (
              <Image
                src={teamLogos[teamFilter]}
                alt={`${teamFilter} logo`}
                width={16}
                height={16}
                className="h-4 w-4 object-contain"
              />
            )}
            <span>{teamFilter || "All Teams"}</span>
          </span>
          <span className="text-[#1bc2ec]">▾</span>
        </button>

        {openFilter === "team" && (
          <div className="absolute left-0 top-full z-80 mt-2 max-h-52 w-full overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1">
            <button
              type="button"
              onClick={() => {
                onTeamFilterChange("");
                onOpenFilter(null);
              }}
              className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                teamFilter === ""
                  ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              All Teams
            </button>

            {teams.map((team) => (
              <button
                key={team}
                type="button"
                onClick={() => {
                  onTeamFilterChange(team);
                  onOpenFilter(null);
                }}
                className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                  teamFilter === team ? "bg-[#1bc2ec]/20" : "hover:bg-white/10"
                }`}
                style={{ color: teamColors[team] }}
              >
                <span className="flex items-center gap-2">
                  <Image
                    src={teamLogos[team]}
                    alt={`${team} logo`}
                    width={16}
                    height={16}
                    className="h-4 w-4 object-contain"
                  />
                  <span>{team}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Archetype filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            onOpenFilter(openFilter === "archetype" ? null : "archetype")
          }
          className="flex min-w-40 cursor-pointer items-center justify-between rounded-md border border-white/20 bg-black/30 px-3 py-1 font-michroma text-xs text-white/70 transition hover:border-[#1bc2ec]/60"
          style={{
            borderColor: selectedArchetypeColor,
          }}
        >
          <span
            className="truncate"
            style={{
              color: selectedArchetypeOption?.archetype
                ? getArchetypePillStyle(selectedArchetypeOption.archetype).color
                : undefined,
            }}
          >
            {archetypeFilter || "All Archetypes"}
          </span>
          <span className="text-[#1bc2ec]">▾</span>
        </button>

        {openFilter === "archetype" && (
          <div className="absolute left-0 top-full z-80 mt-2 max-h-52 w-full overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1">
            <button
              type="button"
              onClick={() => {
                onArchetypeFilterChange("");
                onOpenFilter(null);
              }}
              className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                archetypeFilter === ""
                  ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              All Archetypes
            </button>

            {archetypeOptionDetails.map(({ label, archetype }) => {
              const archetypeColor = archetype
                ? getArchetypePillStyle(archetype).color
                : undefined;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    onArchetypeFilterChange(label);
                    onOpenFilter(null);
                  }}
                  className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                    archetypeFilter === label
                      ? "bg-[#1bc2ec]/20"
                      : "hover:bg-white/10"
                  }`}
                  style={{
                    color: archetypeColor,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Player search */}
      <input
        value={playerSearch}
        onChange={(event) => onPlayerSearchChange(event.target.value)}
        placeholder="Search Player..."
        className="min-w-44 rounded-md border border-white/20 bg-black/30 px-3 py-1 font-michroma text-xs text-white outline-none placeholder:text-white/35 focus:border-white"
      />
    </div>
  );
}
