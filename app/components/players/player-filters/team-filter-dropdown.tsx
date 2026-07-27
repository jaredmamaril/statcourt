import Image from "next/image";
import { getReadableTeamColor, getTeamLogo, type Team } from "../../court-data";

type TeamFilterDropdownProps = {
  teamOptions: Team[];
  filteredTeam: Team | "";
  isOpen: boolean;
  onOpenDropdown: () => void;
  onSelectTeam: (team: Team | "") => void;
};

export function TeamFilterDropdown({
  teamOptions,
  filteredTeam,
  isOpen,
  onOpenDropdown,
  onSelectTeam,
}: TeamFilterDropdownProps) {
  const filteredTeamLogo = filteredTeam ? getTeamLogo(filteredTeam) : null;
  const filteredTeamColor = filteredTeam
    ? getReadableTeamColor(filteredTeam)
    : undefined;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpenDropdown}
        className={`flex h-6 cursor-pointer items-center gap-1 rounded-md border px-2 font-michroma text-[9px] transition-all duration-200 sm:h-auto sm:gap-2 sm:py-1 sm:text-xs ${
          filteredTeam
            ? "scale-[1.02] bg-[color:color-mix(in_srgb,var(--court-accent)_38%,var(--court-panel-alt))] ring-1 ring-[rgb(var(--court-accent-rgb)/0.45)]"
            : "border-white/20 bg-[color:color-mix(in_srgb,var(--court-panel)_86%,black)] text-white/70 hover:border-white/60"
        }`}
        style={{
          color: filteredTeamColor,
          borderColor: filteredTeamColor,
        }}
      >
        {filteredTeamLogo && (
          <Image
            src={filteredTeamLogo}
            alt={`${filteredTeam} logo`}
            width={14}
            height={14}
            className="h-3.5 w-3.5 shrink-0 object-contain sm:h-4 sm:w-4"
          />
        )}

        <span>{filteredTeam || "All Teams"}</span>

        <span className="text-[8px] text-[var(--court-accent)] sm:text-xs">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-1.5 max-h-36 w-22 overflow-y-auto rounded-md border border-white/20 bg-[var(--court-panel-alt)] py-1 shadow-xl animate-[dropdownIn_140ms_ease-out_both] sm:mt-2 sm:max-h-40 sm:w-36">
          <button
            type="button"
            onClick={() => onSelectTeam("")}
            className="block w-full cursor-pointer px-2 py-1.5 text-left font-michroma text-[9px] text-white/70 hover:bg-white/10 sm:px-3 sm:py-2 sm:text-xs"
          >
            All Teams
          </button>

          {teamOptions.map((team) => {
            const teamLogo = getTeamLogo(team);
            const teamColor = getReadableTeamColor(team);

            return (
              <button
                key={team}
                type="button"
                onClick={() => onSelectTeam(team)}
                className={`block w-full cursor-pointer px-2 py-1.5 text-left font-michroma text-[9px] sm:px-3 sm:py-2 sm:text-xs ${
                  filteredTeam === team
                    ? "bg-[color:color-mix(in_srgb,var(--court-accent)_38%,var(--court-panel-alt))] text-[var(--court-accent)]"
                    : "text-white/70 hover:bg-white/10"
                }`}
                style={{ color: teamColor }}
              >
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Image
                    src={teamLogo}
                    alt={`${team} logo`}
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 object-contain sm:h-4 sm:w-4"
                  />

                  <span>{team}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

