"use client";

import type { KeyboardEvent } from "react";
import {
  Trophy,
  Sparkles,
  Flame,
  Target,
  Brain,
  MirrorRectangular,
  Gauge,
  ScrollText,
  Star,
  Shield,
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
  { label: "Overall", value: "careerOverall", Icon: Trophy, color: "#EFBF04" },
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
    label: "Defense",
    value: "defense",
    Icon: Shield,
    color: "#22C55E",
  },
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
  {
    label: "Star",
    value: "starPower",
    Icon: Star,
    color: "#1bc2ec",
  },
];

type RankingTabsProps = {
  activeTab: RankingTab;
  onSelectTab: (tab: RankingTab) => void;
};

export function RankingTabs({ activeTab, onSelectTab }: RankingTabsProps) {
  function selectAndFocusTab(tab: RankingTab) {
    onSelectTab(tab);

    window.requestAnimationFrame(() => {
      document.getElementById(`ranking-tab-${tab}`)?.focus();
    });
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    const lastIndex = rankingTabs.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (event.key === "ArrowLeft") {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    selectAndFocusTab(rankingTabs[nextIndex].value);
  }

  return (
    <div className="-mx-6 mt-0 border-t border-white/10">
      <div
        aria-label="Ranking categories"
        className="statcourt-scroll flex w-full items-start gap-0 overflow-x-auto px-6 py-0 lg:px-0"
        role="tablist"
      >
        {rankingTabs.map((tab, index) => {
          const isActive = activeTab === tab.value;
          const Icon = tab.Icon;

          return (
            <button
              key={tab.value}
              aria-controls={`ranking-panel-${tab.value}`}
              aria-selected={isActive}
              id={`ranking-tab-${tab.value}`}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
              onClick={() => onSelectTab(tab.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`flex shrink-0 cursor-pointer items-center justify-center rounded-b-md rounded-t-none border border-t-0 px-2 font-michroma text-[8px] uppercase tracking-wide transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--court-accent)] lg:min-w-0 lg:px-4 lg:text-xs ${
                isActive
                  ? "h-7 border-[rgb(var(--court-accent-rgb)/0.95)] bg-[color:color-mix(in_srgb,var(--court-accent)_42%,var(--court-panel-alt))] text-[var(--court-accent)] shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.24)] lg:h-auto lg:py-4"
                  : "h-6 border-white/20 bg-[color:color-mix(in_srgb,var(--court-panel)_86%,black)] text-white/60 hover:border-white/35 hover:text-white/85 lg:h-auto lg:py-2.5"
              }`}
            >
              <span className="flex items-center justify-center gap-1 whitespace-nowrap lg:gap-2">
                <Icon
                  className="h-2.5 w-2.5 shrink-0 lg:h-4 lg:w-4"
                  strokeWidth={2}
                />

                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { rankingTabs };

