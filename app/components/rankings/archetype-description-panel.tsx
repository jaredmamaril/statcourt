import { forwardRef } from "react";
import type { archetypeInfoByLabel } from "./archetype-metadata";

type ArchetypeInfo =
  (typeof archetypeInfoByLabel)[keyof typeof archetypeInfoByLabel];

type ArchetypeDescriptionPanelProps = {
  archetypeLabel: string;
  archetypeInfo: ArchetypeInfo | undefined;
  selectedArchetypeColor?: string;
};

export const ArchetypeDescriptionPanel = forwardRef<
  HTMLDivElement,
  ArchetypeDescriptionPanelProps
>(function ArchetypeDescriptionPanel(
  { archetypeLabel, archetypeInfo, selectedArchetypeColor },
  ref,
) {
  if (!archetypeLabel) return null;
  const archetypeColor = selectedArchetypeColor ?? "#1bc2ec";

  return (
    <div
      ref={ref}
      className="scroll-mt-24 mt-4 rounded-md border border-white/10 bg-black/30 p-2.5 lg:mt-6 lg:p-4"
    >
      <h2
        className="font-michroma text-xs uppercase tracking-wide lg:text-sm"
        style={{
          color: archetypeColor,
          textShadow: `0 0 12px ${archetypeColor}66`,
        }}
      >
        {archetypeLabel}
      </h2>

      <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/60 lg:mt-3 lg:text-xs">
        {archetypeInfo?.description ??
          "A player identity class based on this player's strongest statistical profile."}
      </p>

      <div className="mt-3">
        <p className="font-michroma text-[8px] uppercase text-white/40 lg:text-[10px]">
          Core Traits
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5 lg:gap-2">
          {(archetypeInfo?.coreTraits ?? ["Statistical Identity"]).map(
            (trait) => (
              <span
                key={trait}
                className="rounded border px-1.5 py-1 font-michroma text-[6px] lg:px-2 lg:text-[10px]"
                style={{
                  color: archetypeColor,
                  borderColor: archetypeColor,
                  backgroundColor: `${archetypeColor}18`,
                }}
              >
                {trait}
              </span>
            ),
          )}
        </div>
      </div>

      {archetypeInfo && (
        <div className="min-w-0 lg:min-w-56">
          {[
            ["Scoring", archetypeInfo.statBars.scoring],
            ["Rebounding", archetypeInfo.statBars.rebounding],
            ["Playmaking", archetypeInfo.statBars.playmaking],
            ["Shooting", archetypeInfo.statBars.shooting],
          ].map(([label, value]) => (
            <div key={label} className="mt-2">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="font-michroma text-[7px] text-white/50 lg:text-[9px]">
                  {label}
                </span>
                <span className="font-michroma text-[7px] text-white/40 lg:text-[9px]">
                  {value}/10
                </span>
              </div>

              <div className="h-0.5 w-full rounded bg-white/10">
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
