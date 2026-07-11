import type { PlayerRatingCategory } from "../../player-ratings";
import type { SortDirection } from "../../court-data";

const statModeLabels = {
  career: "Career OVR",
  peak: "Peak OVR",
  current: "Latest OVR",
};

type SkillFilterOption = {
  label: string;
  value: PlayerRatingCategory;
};

const skillFilterOptions: SkillFilterOption[] = [
  { label: statModeLabels.career, value: "careerOverall" },
  { label: statModeLabels.peak, value: "peakOverall" },
  { label: statModeLabels.current, value: "currentOverall" },
  { label: "Star Power", value: "starPower" },
  { label: "Career Legacy", value: "careerLegacy" },
  { label: "Defense", value: "defense" },
];

type SkillFilterDropdownProps = {
  selectedSkill: PlayerRatingCategory;
  sortDirection: SortDirection;
  isOpen: boolean;
  onOpenDropdown: () => void;
  onSelectSkill: (skill: PlayerRatingCategory) => void;
};

export function SkillFilterDropdown({
  selectedSkill,
  sortDirection,
  isOpen,
  onOpenDropdown,
  onSelectSkill,
}: SkillFilterDropdownProps) {
  const selectedSkillOption = skillFilterOptions.find(
    (option) => option.value === selectedSkill,
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpenDropdown}
        className="flex h-6 cursor-pointer items-center gap-1 rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-2 font-michroma text-[9px] text-[#1bc2ec] transition-all duration-200 sm:h-auto sm:gap-2 sm:py-1 sm:text-xs"
      >
        <span className="truncate">
          {selectedSkillOption?.label ?? "Career OVR"}
          {" "}
          {sortDirection === "primary" ? "Hi-Lo" : "Lo-Hi"}
        </span>

        <span className="shrink-0 text-[8px] text-[#1bc2ec] sm:text-xs">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-1.5 max-h-44 w-22 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl sm:mt-2 sm:max-h-52 sm:w-40">
          {skillFilterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectSkill(option.value)}
              className={`block w-full cursor-pointer px-2 py-1.5 text-left font-michroma text-[9px] sm:px-3 sm:py-2 sm:text-xs ${
                selectedSkill === option.value
                  ? "bg-[#1bc2ec]/10 text-[#1bc2ec]"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
