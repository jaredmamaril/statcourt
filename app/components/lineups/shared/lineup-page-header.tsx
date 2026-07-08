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
    <div className="mt-0 w-full border-t border-white/10">
      <div className="statcourt-scroll flex w-full items-center gap-1.5 overflow-x-auto px-2 py-2">
        {lineupTabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={`h-6 shrink-0 cursor-pointer rounded-md border px-2 font-michroma text-[8px] uppercase tracking-wide transition-all duration-200 sm:h-9 sm:px-4 sm:text-xs ${
                isActive
                  ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/20 text-[#1bc2ec]"
                  : "border-white/10 bg-black/30 text-white/50 hover:border-white/30 hover:text-white/80"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {shouldShowTopText && (
        <div className="mx-auto max-w-md px-5 pb-2 pt-1 sm:max-w-2xl sm:px-6 sm:pb-3">
          <p className="text-center font-michroma text-[8px] leading-relaxed text-white/40 sm:text-xs">
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
