"use client";

import { lineupTabs } from "../featured/featured-lineups";
import type { LineupTab } from "../shared/lineup-types";

type LineupPageHeaderProps = {
  activeTab: LineupTab;
  shouldShowTopText: boolean;
  onTabChange: (tab: LineupTab) => void;
};

export function LineupPageHeader({
  activeTab,
  shouldShowTopText,
  onTabChange,
}: LineupPageHeaderProps) {
  return (
    <div className="mt-0 flex w-full items-start justify-start overflow-x-auto border-t border-white/10">
      <div className="flex shrink-0 items-start">
        {lineupTabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={`min-w-48 cursor-pointer rounded-b-md border border-t-0 px-4 font-michroma text-xs uppercase tracking-wide transition-all duration-200 ${
                isActive
                  ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/20 py-4 text-[#1bc2ec]"
                  : "border-white/10 bg-black/30 py-2.5 text-white/50 hover:border-white/30 hover:text-white/80"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {shouldShowTopText && (
        <div className="grid flex-1 grid-cols-[auto_1fr] items-start gap-6 pl-10 pt-5">
          <p className="w-full overflow-hidden -mt-1 text-center font-michroma text-xs text-white/40">
            {activeTab === "featured"
              ? "Explore curated lineups and discover unique team archetypes, strengths, and playstyles."
              : activeTab === "builder"
                ? "Build your lineup, then scout the team to uncover its archetype, strengths, weaknesses, and overall potential."
                : "View and manage the lineups you have saved."}
          </p>
        </div>
      )}
    </div>
  );
}
