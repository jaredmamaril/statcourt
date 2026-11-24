"use client";

import Link from "next/link";
import type { StatMode } from "../../components/court-data";
import { getTeamColor } from "../../components/court-data";
import { useStatMode } from "./stat-mode-context";

export type SimilarPlayerMatch = {
  id: number;
  name: string;
  team: string;
  href: string;
  matchScore: number;
};

export function SimilarPlayersList({
  matchesByMode,
}: {
  matchesByMode: Record<StatMode, SimilarPlayerMatch[]>;
}) {
  const statMode = useStatMode();

  return (
    <div className="mt-3 grid gap-2">
      {matchesByMode[statMode].map((match) => {
        const matchTeamColor = getTeamColor(match.team);

        return (
          <Link
            key={match.id}
            href={match.href}
            className="flex items-center justify-between rounded-md border px-3 py-2 font-michroma text-[8px] transition brightness-150 hover:scale-[1.02] lg:text-[10px]"
            style={{
              borderColor: `${matchTeamColor}55`,
              color: matchTeamColor,
              backgroundColor: `${matchTeamColor}35`,
            }}
          >
            <span>{match.name}</span>
            <span>{match.matchScore}%</span>
          </Link>
        );
      })}
    </div>
  );
}

// Same height as four matches, so streaming them in doesn't move the page.
export function SimilarPlayersFallback() {
  return (
    <div className="mt-3 grid gap-2" aria-busy="true" aria-label="Loading similar players">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 font-michroma text-[8px] text-transparent lg:text-[10px]"
        >
          Loading
        </div>
      ))}
    </div>
  );
}
