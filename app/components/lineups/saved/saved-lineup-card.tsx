import { getLineupTierColor } from "../../lineup-scouting";
import type { SavedLineup } from "../shared/lineup-types";
import {
  LineupBadgeIcon,
  getSavedLineupArchetypeColor,
  getSavedLineupTopScore,
} from "../shared/lineup-style-helpers";

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

        <div
          className="rounded-md border px-3 py-2 text-center transition-all duration-200"
          style={{
            borderColor: `${archetypeColor}80`,
            backgroundColor: `${archetypeColor}18`,
            boxShadow: `0 0 14px ${archetypeColor}22`,
          }}
        >
          <p
            className="font-michroma text-lg"
            style={{
              color: archetypeColor,
              textShadow: `0 0 12px ${archetypeColor}99`,
            }}
          >
            {lineup.overall.toFixed(1)}
          </p>

          <p className="font-michroma text-[8px] uppercase text-white/40">
            OVR
          </p>

          {topScore && (
            <p
              className="mt-1 font-michroma text-[7px] uppercase"
              style={{ color: archetypeColor }}
            >
              {Math.round(topScore.value)} {topScore.label}
            </p>
          )}
        </div>
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

      <div className="mt-4 flex flex-wrap gap-1">
        {lineup.badges.slice(0, 3).map((badge) => (
          <span
            key={badge}
            className="flex items-center gap-1 rounded border px-2 py-1 font-michroma text-[7.5px]"
            style={{
              color: archetypeColor,
              borderColor: `${archetypeColor}50`,
              backgroundColor: `${archetypeColor}12`,
            }}
          >
            <LineupBadgeIcon badge={badge} />
            {badge}
          </span>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => onLoad(lineup)}
          className="rounded-md border px-3 py-2 font-michroma text-[8px] uppercase transition hover:brightness-150"
          style={{
            color: archetypeColor,
            borderColor: `${archetypeColor}80`,
            backgroundColor: `${archetypeColor}28`,
          }}
        >
          Load
        </button>

        <button
          type="button"
          onClick={() => onScout(lineup)}
          className="rounded-md border px-3 py-2 font-michroma text-[8px] uppercase transition hover:brightness-150"
          style={{
            color: archetypeColor,
            borderColor: `${archetypeColor}50`,
            backgroundColor: `${archetypeColor}10`,
          }}
        >
          Scout
        </button>

        <button
          type="button"
          onClick={() => onRename(lineup)}
          className="rounded-md border bg-white/5 px-3 py-2 font-michroma text-[8px] uppercase text-white/45 transition hover:brightness-150"
          style={{
            borderColor: `${archetypeColor}33`,
          }}
        >
          Rename
        </button>

        <button
          type="button"
          onClick={() => onDelete(lineup)}
          className="ml-auto rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 font-michroma text-[8px] uppercase text-red-400 transition hover:bg-red-500/20"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
