import { forwardRef } from "react";
import type { archetypeInfoByLabel } from "./archetype-metadata";

type ArchetypeInfo =
  (typeof archetypeInfoByLabel)[keyof typeof archetypeInfoByLabel];

type ArchetypeDescriptionPanelProps = {
  archetypeLabel: string;
  archetypeInfo: ArchetypeInfo | undefined;
};

export const ArchetypeDescriptionPanel = forwardRef<
  HTMLDivElement,
  ArchetypeDescriptionPanelProps
>(function ArchetypeDescriptionPanel({ archetypeLabel, archetypeInfo }, ref) {
  if (!archetypeLabel) return null;

  return (
    <div
      ref={ref}
      className="scroll-mt-24 mt-6 rounded-md border border-white/10 bg-black/30 p-4"
    >
      <h2 className="font-michroma text-sm uppercase tracking-wide text-white">
        {archetypeLabel}
      </h2>

      <p className="mt-3 font-michroma text-xs leading-relaxed text-white/60">
        {archetypeInfo?.description ??
          "A player identity class based on this player's strongest statistical profile."}
      </p>

      <div className="mt-3">
        <p className="font-michroma text-[10px] uppercase text-white/40">
          Core Traits
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {(archetypeInfo?.coreTraits ?? ["Statistical Identity"]).map(
            (trait) => (
              <span
                key={trait}
                className="rounded border border-[#1bc2ec]/40 bg-[#1bc2ec]/10 px-2 py-1 font-michroma text-[10px] text-[#1bc2ec]"
              >
                {trait}
              </span>
            ),
          )}
        </div>
      </div>

      {archetypeInfo && (
        <div className="min-w-56">
          {[
            ["Scoring", archetypeInfo.statBars.scoring],
            ["Rebounding", archetypeInfo.statBars.rebounding],
            ["Playmaking", archetypeInfo.statBars.playmaking],
            ["Shooting", archetypeInfo.statBars.shooting],
          ].map(([label, value]) => (
            <div key={label} className="mt-2">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="font-michroma text-[9px] text-white/50">
                  {label}
                </span>
                <span className="font-michroma text-[9px] text-white/40">
                  {value}/10
                </span>
              </div>

              <div className="h-1.5 w-full rounded bg-white/10">
                <div
                  className="h-full rounded bg-[#1bc2ec]"
                  style={{
                    width: `${Number(value) * 10}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
