import { positions, type Position } from "../../court-data";

type PositionFilterDropdownProps = {
  filteredPosition: Position | "";
  isOpen: boolean;
  onOpenDropdown: () => void;
  onSelectPosition: (position: Position | "") => void;
};

export function PositionFilterDropdown({
  filteredPosition,
  isOpen,
  onOpenDropdown,
  onSelectPosition,
}: PositionFilterDropdownProps) {
  const dropdownId = "players-position-filter-menu";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpenDropdown}
        aria-label="Filter players by position"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        aria-haspopup="true"
        className={`flex min-h-9 cursor-pointer items-center gap-1 rounded-md border px-2 font-michroma text-[9px] transition-all duration-200 sm:min-h-8 sm:gap-2 sm:py-1 sm:text-xs ${
          filteredPosition
            ? "scale-[1.02] border-[rgb(var(--court-accent-rgb)/0.7)] bg-[color:color-mix(in_srgb,var(--court-accent)_38%,var(--court-panel-alt))] text-[var(--court-accent)] ring-1 ring-[rgb(var(--court-accent-rgb)/0.45)]"
            : "border-white/20 bg-[color:color-mix(in_srgb,var(--court-panel)_86%,black)] text-white/70 hover:border-white/60"
        }`}
      >
        <span>{filteredPosition || "All Positions"}</span>
        <span className="text-[8px] text-[var(--court-accent)] sm:text-xs">▾</span>
      </button>

      {isOpen && (
        <div id={dropdownId} className="absolute left-0 top-full z-30 mt-1.5 max-h-36 w-25 overflow-y-auto rounded-md border border-white/20 bg-[var(--court-panel-alt)] py-1 shadow-xl animate-[dropdownIn_140ms_ease-out_both] sm:mt-2 sm:max-h-40 sm:w-36">
          <button
            type="button"
            onClick={() => onSelectPosition("")}
            className="block w-full cursor-pointer px-2 py-1.5 text-left font-michroma text-[9px] text-white/70 hover:bg-white/10 sm:px-3 sm:py-2 sm:text-xs"
          >
            All Positions
          </button>

          {positions.map((position) => (
            <button
              key={position}
              type="button"
              onClick={() => onSelectPosition(position)}
              className={`block w-full cursor-pointer px-2 py-1.5 text-left font-michroma text-[9px] sm:px-3 sm:py-2 sm:text-xs ${
                filteredPosition === position
                  ? "bg-[color:color-mix(in_srgb,var(--court-accent)_38%,var(--court-panel-alt))] text-[var(--court-accent)]"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              {position}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

