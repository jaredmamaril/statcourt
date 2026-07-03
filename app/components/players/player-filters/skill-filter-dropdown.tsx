import type { PlayerRatingCategory } from "../../player-ratings";

type SkillFilterOption = {
  label: string;
  value: PlayerRatingCategory;
};

const skillFilterOptions: SkillFilterOption[] = [
  { label: "Career", value: "careerOverall" },
  { label: "Peak", value: "peakOverall" },
  { label: "Star Power", value: "starPower" },
  { label: "Career Legacy", value: "careerLegacy" },
  { label: "Defense", value: "defense" },
];

type SkillFilterDropdownProps = {
  selectedSkill: PlayerRatingCategory;
  isOpen: boolean;
  onOpenDropdown: () => void;
  onSelectSkill: (skill: PlayerRatingCategory) => void;
};

export function SkillFilterDropdown({
  selectedSkill,
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
        className="flex cursor-pointer items-center gap-2 rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-2 py-1 font-michroma text-xs text-[#1bc2ec] transition-all duration-200"
      >
        <span>{selectedSkillOption?.label ?? "Career OVR"}</span>
        <span className="text-[#1bc2ec]">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-52 w-40 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl">
          {skillFilterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectSkill(option.value)}
              className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs ${
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
