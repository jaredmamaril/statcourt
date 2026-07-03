import {
  Trophy,
  Sparkles,
  Flame,
  Target,
  Brain,
  MirrorRectangular,
  Gauge,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PlayerRatingCategory } from "../player-ratings";

export type RankingTab = PlayerRatingCategory | "archetypes";

const rankingTabs: {
  label: string;
  value: RankingTab;
  Icon: LucideIcon;
  color: string;
}[] = [
  { label: "Overall", value: "overall", Icon: Trophy, color: "#EFBF04" },
  {
    label: "Archetypes",
    value: "archetypes",
    Icon: Sparkles,
    color: "#A855F7",
  },
  { label: "Scoring", value: "scoring", Icon: Flame, color: "#EF4444" },
  { label: "Shooting", value: "shooting", Icon: Target, color: "#1bc2ec" },
  { label: "Playmaking", value: "playmaking", Icon: Brain, color: "#3B82F6" },
  {
    label: "Rebounding",
    value: "rebounding",
    Icon: MirrorRectangular,
    color: "#A855F7",
  },
  { label: "Efficiency", value: "efficiency", Icon: Gauge, color: "#22C55E" },
  {
    label: "Legacy",
    value: "careerLegacy",
    Icon: ScrollText,
    color: "#EFBF04",
  },
];

type RankingTabsProps = {
  activeTab: RankingTab;
  onSelectTab: (tab: RankingTab) => void;
};

export function RankingTabs({ activeTab, onSelectTab }: RankingTabsProps) {
  return (
    <div className="mt-0 flex w-full items-start overflow-x-auto pb-0">
      {rankingTabs.map((tab) => {
        const isActive = activeTab === tab.value;
        const Icon = tab.Icon;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onSelectTab(tab.value)}
            className={`min-w-36 cursor-pointer rounded-b-md border border-t-0 px-4 font-michroma text-xs uppercase tracking-wide transition-all duration-200 ${
              isActive
                ? "py-4 border-[#1bc2ec]/70 bg-[#1bc2ec]/20 text-[#1bc2ec]"
                : "py-2.5 border-white/10 bg-black/30 text-white/50 hover:border-white/30 hover:text-white/80"
            }`}
          >
            <span className="flex items-center justify-center gap-2 whitespace-nowrap">
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { rankingTabs };
