import { getLineupTierColor } from "../../lineup-scouting";
import type { SavedLineup } from "../shared/lineup-types";
import {
  getSavedLineupArchetypeColor,
  getSavedLineupTopScore,
} from "../shared/lineup-style-helpers";
import { SavedLineupOverallBox } from "./saved-lineup-overall-box";
import { SavedLineupCardActions } from "./saved-lineup-card-actions";
import { SavedLineupBadges } from "./saved-lineup-badges";

type SavedLineupCardProps = {
  lineup: SavedLineup;
  onLoad: (lineup: SavedLineup) => void;
  onScout: (lineup: SavedLineup) => void;
  onRename: (lineup: SavedLineup) => void;
  onDelete: (lineup: SavedLineup) => void;
};

export function SavedLineupCard({
  lineup,
  onLoad,
  onScout,
  onRename,
  onDelete,
}: SavedLineupCardProps) {
  const archetypeColor = getSavedLineupArchetypeColor(lineup.archetype);
  const tierColor = getLineupTierColor(lineup.tier);
  const topScore = getSavedLineupTopScore(lineup);

  return (
    <div
      className="group rounded-md border border-white/10 bg-black/25 p-4 transition-all duration-200 hover:-translate-y-1"
      style={{
        borderColor: `${archetypeColor}33`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-michroma text-[17px] text-white">
            {lineup.name}
          </p>

          <p className="mt-1 font-michroma text-[8px] text-white/30">
            Saved{" "}
            {new Date(lineup.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <SavedLineupOverallBox
          overall={lineup.overall}
          topScore={topScore}
          archetypeColor={archetypeColor}
        />
      </div>

      <div>
        <p
          className="font-michroma text-[15px]"
          style={{
            color: archetypeColor,
            textShadow: `0 0 10px ${archetypeColor}77`,
          }}
        >
          {lineup.archetype}
        </p>

        <p
          className="mt-1 font-michroma text-[12px]"
          style={{ color: `${archetypeColor}bb` }}
        >
          {lineup.teamIdentity}
        </p>

        <p
          className="mt-1 font-michroma text-[10px]"
          style={{ color: tierColor }}
        >
          {lineup.tier ?? "Saved Lineup"}
        </p>
      </div>

      <p className="mt-4 truncate font-michroma text-[9px] text-white/45 text-center">
        {Object.values(lineup.players)
          .map((playerName) => playerName.split(" ").at(-1) ?? playerName)
          .join(" - ")}
      </p>

      <SavedLineupBadges
        badges={lineup.badges}
        archetypeColor={archetypeColor}
      />

      <SavedLineupCardActions
        lineup={lineup}
        archetypeColor={archetypeColor}
        onLoad={onLoad}
        onScout={onScout}
        onRename={onRename}
        onDelete={onDelete}
      />
    </div>
  );
}
