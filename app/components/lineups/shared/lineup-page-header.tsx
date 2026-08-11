"use client";

import type { KeyboardEvent } from "react";
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
  function selectAndFocusTab(tab: LineupTab) {
    onTabChange(tab);

    window.requestAnimationFrame(() => {
      document.getElementById(`lineup-tab-${tab}`)?.focus();
    });
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    const lastIndex = lineupTabs.length - 1;
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
    selectAndFocusTab(lineupTabs[nextIndex].value);
  }

  return (
    <div className="-mx-3 mt-0 border-t border-white/10 sm:-mx-6">
      <div
        aria-label="Lineup sections"
        className="statcourt-scroll flex w-full items-start gap-0 overflow-x-auto px-3 sm:px-6 lg:px-0"
        role="tablist"
      >
        {lineupTabs.map((tab, index) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              aria-controls={`lineup-panel-${tab.value}`}
              aria-selected={isActive}
              id={`lineup-tab-${tab.value}`}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
              onClick={() => onTabChange(tab.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`flex shrink-0 cursor-pointer items-center justify-center rounded-b-md rounded-t-none border border-t-0 px-3 font-michroma text-[9px] uppercase tracking-wide transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--court-accent)] sm:px-4 sm:text-xs ${
                isActive
                  ? "h-7 border-[rgb(var(--court-accent-rgb)/0.9)] bg-[rgb(var(--court-accent-rgb)/0.34)] text-[var(--court-accent)] shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.18)] sm:h-10 lg:h-auto lg:py-4"
                  : "h-6 border-white/20 bg-[color:color-mix(in_srgb,var(--court-panel)_86%,black)] text-white/60 hover:border-white/35 hover:text-white/85 sm:h-8 lg:h-auto lg:py-2.5"
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
