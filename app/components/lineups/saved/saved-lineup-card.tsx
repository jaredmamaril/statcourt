import { getLineupTierColor } from "../../lineup-scouting";
import type { SavedLineup } from "../shared/lineup-types";
import {
  getSavedLineupArchetypeColor,
  getSavedLineupTopScore,
} from "../shared/lineup-style-helpers";
import { SavedLineupOverallBox } from "./saved-lineup-overall-box";
import { SavedLineupCardActions } from "./saved-lineup-card-actions";
import { SavedLineupBadges } from "./saved-lineup-badges";

const statProfileLabels = {
  career: "Career",
  peak: "Peak",
  current: "Latest",
};

type SavedLineupCardProps = {
  lineup: SavedLineup;
  index: number;
  isLoadingPlayers: boolean;
  onLoad: (lineup: SavedLineup) => void;
  onScout: (lineup: SavedLineup) => void;
  onRename: (lineup: SavedLineup) => void;
  onTogglePublic: (lineup: SavedLineup) => void;
  onDelete: (lineup: SavedLineup) => void;
};

export function SavedLineupCard({
  lineup,
  index,
  isLoadingPlayers,
  onLoad,
  onScout,
  onRename,
  onTogglePublic,
  onDelete,
}: SavedLineupCardProps) {
  const archetypeColor = getSavedLineupArchetypeColor(lineup.archetype);
  const tierColor = getLineupTierColor(lineup.tier);
  const topScore = getSavedLineupTopScore(lineup);
  const statProfileLabel = statProfileLabels[lineup.statProfile ?? "career"];
  const visibleBadges =
    lineup.badges.length > 0
      ? lineup.badges
      : [lineup.teamIdentity, ...lineup.strengths].filter(Boolean).slice(0, 3);

  return (
    <div
      className="group animate-[playerListRowIn_180ms_ease-out_both] rounded-md border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-2 transition-all duration-200 hover:-translate-y-1 lg:p-4"
      style={{
        borderColor: `${archetypeColor}33`,
        animationDelay: `${Math.min(index, 10) * 35}ms`,
      }}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 lg:flex lg:justify-between lg:gap-4">
        <div className="min-w-0">
          <p className="truncate font-michroma text-[7px] text-white lg:text-[17px]">
            {lineup.name}
          </p>

          <p className="mt-0.5 font-michroma text-[5px] text-white/30 lg:mt-1 lg:text-[8px]">
            Saved{" "}
            {new Date(lineup.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-1">
            <p className="w-fit rounded border border-white/15 bg-white/8 px-1.5 py-0.5 font-michroma text-[4.5px] uppercase text-white/45 lg:px-2 lg:text-[7px]">
              {statProfileLabel}
            </p>

            <button
              type="button"
              onClick={() => onTogglePublic(lineup)}
              className="w-fit cursor-pointer rounded-md border px-2 py-1 font-michroma text-[5.5px] uppercase shadow-[0_0_10px_rgb(var(--court-accent-rgb)/0.08)] transition hover:scale-105 hover:text-white lg:px-2.5 lg:py-1.5 lg:text-[8px]"
              style={{
                color: lineup.isPublic ? "#22C55E" : "rgba(255,255,255,0.45)",
                borderColor: lineup.isPublic
                  ? "#22C55E99"
                  : `${archetypeColor}66`,
                backgroundColor: lineup.isPublic
                  ? "#22C55E22"
                  : `${archetypeColor}12`,
              }}
            >
              {lineup.isPublic ? "Public" : "Private"}
            </button>
          </div>
        </div>

        <SavedLineupOverallBox
          overall={lineup.overall}
          topScore={topScore}
          archetypeColor={archetypeColor}
        />
      </div>

      <div>
        <p
          className="mt-1 font-michroma text-[6.5px] lg:text-[15px]"
          style={{
            color: archetypeColor,
            textShadow: `0 0 10px ${archetypeColor}77`,
          }}
        >
          {lineup.archetype}
        </p>

        <p
          className="mt-0.5 font-michroma text-[5.5px] lg:mt-1 lg:text-[12px]"
          style={{ color: `${archetypeColor}bb` }}
        >
          {lineup.teamIdentity}
        </p>

        <p
          className="mt-0.5 font-michroma text-[5px] lg:mt-1 lg:text-[10px]"
          style={{ color: tierColor }}
        >
          {lineup.tier ?? "Saved Lineup"}
        </p>
      </div>

      <p className="mt-1 truncate text-center font-michroma text-[5px] text-white/45 lg:mt-4 lg:text-[9px]">
        {Object.values(lineup.players)
          .map((playerName) => playerName.split(" ").at(-1) ?? playerName)
          .join(" - ")}
      </p>

      <SavedLineupBadges
        badges={visibleBadges}
        archetypeColor={archetypeColor}
      />

      <SavedLineupCardActions
        lineup={lineup}
        archetypeColor={archetypeColor}
        isLoadingPlayers={isLoadingPlayers}
        onLoad={onLoad}
        onScout={onScout}
        onRename={onRename}
        onDelete={onDelete}
      />
    </div>
  );
}
