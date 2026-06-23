import Image from "next/image";
import { teams, teamColors, teamLogos, type Team } from "../../court-data";

type TeamFilterDropdownProps = {
  filteredTeam: Team | "";
  isOpen: boolean;
  onOpenDropdown: () => void;
  onSelectTeam: (team: Team | "") => void;
};

export function TeamFilterDropdown({
  filteredTeam,
  isOpen,
  onOpenDropdown,
  onSelectTeam,
}: TeamFilterDropdownProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpenDropdown}
        className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 font-michroma text-xs transition-all duration-200 ${
          filteredTeam
            ? "bg-[#1bc2ec]/10"
            : "border-white/20 bg-black/10 text-white/60 hover:border-white/60"
        }`}
        style={{
          color: filteredTeam ? teamColors[filteredTeam] : undefined,
          borderColor: filteredTeam ? teamColors[filteredTeam] : undefined,
        }}
      >
        {filteredTeam && (
          <Image
            src={teamLogos[filteredTeam]}
            alt={`${filteredTeam} logo`}
            width={16}
            height={16}
            className="h-4 w-4 shrink-0 object-contain"
          />
        )}
        <span>{filteredTeam || "All Teams"}</span>
        <span className="text-[#1bc2ec]">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-40 w-36 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl">
          <button
            type="button"
            onClick={() => onSelectTeam("")}
            className="block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs text-white/70 hover:bg-white/10"
          >
            All Teams
          </button>

          {teams.map((team) => (
            <button
              key={team}
              type="button"
              onClick={() => onSelectTeam(team)}
              className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs ${
                filteredTeam === team
                  ? "bg-[#1bc2ec]/10 text-[#1bc2ec]"
                  : "text-white/70 hover:bg-white/10"
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
  );
}
