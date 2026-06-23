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
        className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 font-michroma text-xs transition-all duration-200 ${
          filteredPosition
            ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/10 text-[#1bc2ec]"
            : "border-white/20 bg-black/10 text-white/60 hover:border-white/60"
        }`}
      >
        <span>{filteredPosition || "All Positions"}</span>
        <span className="text-[#1bc2ec]">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-40 w-36 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl">
          <button
            type="button"
            onClick={() => onSelectPosition("")}
            className="block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs text-white/70 hover:bg-white/10"
          >
            All Positions
          </button>

          {positions.map((position) => (
            <button
              key={position}
              type="button"
              onClick={() => onSelectPosition(position)}
              className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs ${
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
