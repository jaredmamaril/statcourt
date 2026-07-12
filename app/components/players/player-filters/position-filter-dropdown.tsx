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
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpenDropdown}
        className={`flex h-6 cursor-pointer items-center gap-1 rounded-md border px-2 font-michroma text-[9px] transition-all duration-200 sm:h-auto sm:gap-2 sm:py-1 sm:text-xs ${
          filteredPosition
            ? "scale-[1.02] border-[#1bc2ec]/70 bg-[#1bc2ec]/10 text-[#1bc2ec] ring-1 ring-[#1bc2ec]/30"
            : "border-white/20 bg-black/10 text-white/60 hover:border-white/60"
        }`}
      >
        <span>{filteredPosition || "All Positions"}</span>
        <span className="text-[8px] text-[#1bc2ec] sm:text-xs">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-1.5 max-h-36 w-25 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl animate-[dropdownIn_140ms_ease-out_both] sm:mt-2 sm:max-h-40 sm:w-36">
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
                  ? "bg-[#1bc2ec]/10 text-[#1bc2ec]"
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
