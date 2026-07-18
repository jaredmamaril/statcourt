import Image from "next/image";
import type { CSSProperties } from "react";
import {
  positions,
  teams,
  teamColors,
  teamLogos,
  type Position,
  type Team,
} from "../court-data";
import { getArchetypePillStyle } from "./ranking-style-helpers";
import { RankingStatProfileFilter } from "./ranking-stat-profile-filter";
import type { DefaultPlayerView } from "../../lib/use-user-settings";

type OpenFilter =
  | "profile"
  | "position"
  | "team"
  | "archetype"
  | "view"
  | null;

type ArchetypeOptionDetail = {
  label: string;
  archetype: Parameters<typeof getArchetypePillStyle>[0] | null;
};

type RankingFilterBarProps = {
  openFilter: OpenFilter;
  statProfileFilter: "career" | "peak" | "current";
  positionFilter: Position | "";
  teamFilter: Team | "";
  playerSearch: string;
  archetypeFilter: string;
  displayView: DefaultPlayerView;
  selectedArchetypeColor: string | undefined;
  selectedArchetypeOption: ArchetypeOptionDetail | undefined;
  archetypeOptionDetails: ArchetypeOptionDetail[];
  onOpenFilter: (filter: OpenFilter) => void;
  onStatProfileFilterChange: (value: "career" | "peak" | "current") => void;
  onPositionFilterChange: (value: Position | "") => void;
  onTeamFilterChange: (value: Team | "") => void;
  onArchetypeFilterChange: (value: string) => void;
  onDisplayViewChange: (value: DefaultPlayerView) => void;
  onPlayerSearchChange: (value: string) => void;
};

export function RankingFilterBar({
  openFilter,
  statProfileFilter,
  positionFilter,
  teamFilter,
  playerSearch,
  archetypeFilter,
  displayView,
  selectedArchetypeColor,
  selectedArchetypeOption,
  archetypeOptionDetails,
  onOpenFilter,
  onStatProfileFilterChange,
  onPositionFilterChange,
  onTeamFilterChange,
  onArchetypeFilterChange,
  onDisplayViewChange,
  onPlayerSearchChange,
}: RankingFilterBarProps) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 px-3 sm:gap-2 sm:px-0">
      <RankingStatProfileFilter
        isOpen={openFilter === "profile"}
        selectedProfile={statProfileFilter}
        onToggle={() =>
          onOpenFilter(openFilter === "profile" ? null : "profile")
        }
        onSelectProfile={(profile) => {
          onStatProfileFilterChange(profile);
          onOpenFilter(null);
        }}
      />

      <div className="relative">
        <button
          type="button"
          onClick={() =>
            onOpenFilter(openFilter === "position" ? null : "position")
          }
          className={`flex h-6 cursor-pointer items-center gap-1 rounded-md border px-2 font-michroma text-[9px] transition sm:h-auto sm:gap-3 sm:py-1 sm:text-xs ${
            positionFilter
              ? "w-14 scale-[1.02] border-[#1bc2ec] bg-[#1bc2ec]/10 text-[#1bc2ec] ring-1 ring-[#1bc2ec]/30 sm:w-18 sm:px-3"
              : "w-32 border-white/20 bg-black/30 text-white/70 hover:border-white/60 sm:w-40 sm:px-3"
          }`}
        >
          <span className="flex-1 text-left">
            {positionFilter || "All Positions"}
          </span>
          <span className="shrink-0 text-[#1bc2ec]">▾</span>
        </button>

        {openFilter === "position" && (
          <div className="absolute left-0 top-full z-80 mt-2 max-h-80 w-34 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 animate-[dropdownIn_140ms_ease-out_both]">
            <button
              type="button"
              onClick={() => {
                onPositionFilterChange("");
                onOpenFilter(null);
              }}
              className={`block w-full cursor-pointer px-2 py-1.5 text-[9px] sm:px-3 sm:py-2 sm:text-xs text-left font-michroma transition ${
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
                className={`block w-full cursor-pointer px-2 py-1.5 text-[9px] sm:px-3 sm:py-2 sm:text-xs text-left font-michroma transition ${
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
          className={`flex h-6 min-w-28 cursor-pointer items-center justify-between rounded-md border px-2 font-michroma text-[9px] transition sm:h-auto sm:min-w-32 sm:px-3 sm:py-1 sm:text-xs ${
            teamFilter
              ? "scale-[1.02] bg-black/30 ring-1"
              : "border-white/20 bg-black/30 text-white/70 hover:border-[#1bc2ec]/60"
          }`}
          style={{
            color: teamFilter ? teamColors[teamFilter] : undefined,
            borderColor: teamFilter ? teamColors[teamFilter] : undefined,
            "--tw-ring-color": teamFilter
              ? `${teamColors[teamFilter]}4D`
              : undefined,
          } as CSSProperties}
        >
          <span className="flex items-center gap-2">
            {teamFilter && (
              <Image
                src={teamLogos[teamFilter]}
                alt={`${teamFilter} logo`}
                width={16}
                height={16}
                className="h-3.5 w-3.5 object-contain sm:h-4 sm:w-4"
              />
            )}
            <span>{teamFilter || "All Teams"}</span>
          </span>
          <span className="text-[#1bc2ec]">▾</span>
        </button>

        {openFilter === "team" && (
          <div className="absolute left-0 top-full z-80 mt-2 max-h-52 w-full overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 animate-[dropdownIn_140ms_ease-out_both]">
            <button
              type="button"
              onClick={() => {
                onTeamFilterChange("");
                onOpenFilter(null);
              }}
              className={`block w-full cursor-pointer px-2 py-1.5 text-[9px] sm:px-3 sm:py-2 sm:text-xs text-left font-michroma text-xs transition ${
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
                className={`block w-full cursor-pointer px-2 py-1.5 text-[9px] sm:px-3 sm:py-2 sm:text-xs text-left font-michroma transition ${
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

      <div className="relative">
        <button
          type="button"
          onClick={() =>
            onOpenFilter(openFilter === "archetype" ? null : "archetype")
          }
          className={`flex h-6 min-w-36 cursor-pointer items-center justify-between rounded-md border px-2 font-michroma text-[9px] transition sm:h-auto sm:min-w-40 sm:px-3 sm:py-1 sm:text-xs ${
            archetypeFilter
              ? "scale-[1.02] bg-black/30 ring-1"
              : "border-white/20 bg-black/30 text-white/70 hover:border-[#1bc2ec]/60"
          }`}
          style={{
            borderColor: selectedArchetypeColor,
            "--tw-ring-color": selectedArchetypeColor
              ? `${selectedArchetypeColor}4D`
              : undefined,
          } as CSSProperties}
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
          <div className="absolute left-0 top-full z-80 mt-2 max-h-52 w-full overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 animate-[dropdownIn_140ms_ease-out_both]">
            <button
              type="button"
              onClick={() => {
                onArchetypeFilterChange("");
                onOpenFilter(null);
              }}
              className={`block w-full cursor-pointer px-2 py-1.5 text-[9px] sm:px-3 sm:py-2 sm:text-xs text-left font-michroma transition ${
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
                  className={`block w-full cursor-pointer px-2 py-1.5 text-[9px] sm:px-3 sm:py-2 sm:text-xs text-left font-michroma transition ${
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

      <div className="relative">
        <button
          type="button"
          onClick={() => onOpenFilter(openFilter === "view" ? null : "view")}
          className="flex h-6 min-w-20 cursor-pointer items-center justify-between rounded-md border border-white/20 bg-black/30 px-2 font-michroma text-[9px] text-white/70 transition hover:border-[#1bc2ec]/60 hover:text-[#1bc2ec] sm:h-auto sm:min-w-24 sm:px-3 sm:py-1 sm:text-xs"
        >
          <span>{displayView === "cards" ? "Cards" : "List"}</span>
          <span className="text-[#1bc2ec]">▾</span>
        </button>

        {openFilter === "view" && (
          <div className="absolute left-0 top-full z-80 mt-2 w-full overflow-hidden rounded-md border border-white/20 bg-[#07111f] py-1 animate-[dropdownIn_140ms_ease-out_both]">
            {(["cards", "list"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => {
                  onDisplayViewChange(view);
                  onOpenFilter(null);
                }}
                className={`block w-full cursor-pointer px-2 py-1.5 text-left font-michroma text-[9px] capitalize transition sm:px-3 sm:py-2 sm:text-xs ${
                  displayView === view
                    ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        value={playerSearch}
        onChange={(event) => onPlayerSearchChange(event.target.value)}
        placeholder="Search Player..."
        className="h-6 min-w-40 rounded-md border border-white/20 bg-black/30 px-2 font-michroma text-[9px] text-white outline-none placeholder:text-white/35 focus:border-white sm:h-auto sm:min-w-44 sm:px-3 sm:py-1 sm:text-xs"
      />
    </div>
  );
}
