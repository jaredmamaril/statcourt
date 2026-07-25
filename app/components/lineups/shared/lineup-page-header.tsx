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
    <div className="-mx-3 mt-0 border-t border-white/10 sm:-mx-6">
      <div className="statcourt-scroll flex w-full items-start gap-0 overflow-x-auto px-3 sm:px-6 lg:px-0">
        {lineupTabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={`flex shrink-0 cursor-pointer items-center justify-center rounded-b-md rounded-t-none border border-t-0 px-3 font-michroma text-[9px] uppercase tracking-wide transition-all duration-200 sm:px-4 sm:text-xs ${
                isActive
                  ? "h-7 border-[rgb(var(--court-accent-rgb)/0.7)] bg-[rgb(var(--court-accent-rgb)/0.2)] text-[var(--court-accent)] sm:h-10 lg:h-auto lg:py-4"
                  : "h-6 border-white/10 bg-black/30 text-white/50 hover:border-white/30 hover:text-white/80 sm:h-8 lg:h-auto lg:py-2.5"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {shouldShowTopText && (
        <div className="mx-auto max-w-77.5 px-3 pb-2 pt-3 sm:max-w-2xl sm:px-6 sm:pb-3">
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
