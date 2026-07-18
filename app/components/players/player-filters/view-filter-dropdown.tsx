import type { DefaultPlayerView } from "../../../lib/use-user-settings";

type ViewFilterDropdownProps = {
  selectedView: DefaultPlayerView;
  isOpen: boolean;
  onOpenDropdown: () => void;
  onSelectView: (view: DefaultPlayerView) => void;
};

const viewOptions: { label: string; value: DefaultPlayerView }[] = [
  { label: "Cards", value: "cards" },
  { label: "List", value: "list" },
];

export function ViewFilterDropdown({
  selectedView,
  isOpen,
  onOpenDropdown,
  onSelectView,
}: ViewFilterDropdownProps) {
  const selectedViewLabel =
    viewOptions.find((option) => option.value === selectedView)?.label ??
    "Cards";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpenDropdown}
        className="flex h-6 cursor-pointer items-center gap-1 rounded-md border border-white/20 bg-black/10 px-2 font-michroma text-[9px] text-white/60 transition-all duration-200 hover:border-[#1bc2ec]/50 hover:text-[#1bc2ec] sm:h-auto sm:gap-2 sm:py-1 sm:text-xs"
      >
        <span>{selectedViewLabel}</span>
        <span className="text-[8px] text-[#1bc2ec] sm:text-xs">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-24 rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl animate-[dropdownIn_140ms_ease-out_both] sm:mt-2 sm:w-32">
          {viewOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectView(option.value)}
              className={`block w-full cursor-pointer px-2 py-1.5 text-left font-michroma text-[9px] sm:px-3 sm:py-2 sm:text-xs ${
                selectedView === option.value
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
