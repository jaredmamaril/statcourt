import { ScoutArchetypeTooltip } from "./scout-archetype-tooltip";

type ScoutArchetypeSectionProps = {
  lineupArchetype: string;
  scoutReason: string;
  teamIdentity: string;
  scoutArchetypeColor: string;
};

export function ScoutArchetypeSection({
  lineupArchetype,
  scoutReason,
  teamIdentity,
  scoutArchetypeColor,
}: ScoutArchetypeSectionProps) {
  return (
    <>
      <div
        className="scout-section-reveal relative z-500"
        style={{ animationDelay: "200ms" }}
      >
        <div className="mt-1 lg:mt-0">
          <ScoutArchetypeTooltip scoutArchetypeColor={scoutArchetypeColor} />

          <p
            className="font-michroma text-[10px] lg:text-sm"
            style={{
              color: scoutArchetypeColor,
              textShadow: `0 0 10px ${scoutArchetypeColor}88`,
            }}
          >
            {lineupArchetype}
          </p>
        </div>

        <div>
          <p className="mt-1 font-michroma text-[7px] uppercase text-white/40 lg:text-[10px]">
            Why This Archetype
          </p>

          <p className="mt-1 max-w-full font-michroma text-[6.5px] leading-relaxed text-white/45 lg:max-w-75 lg:text-[9px]">
            {scoutReason}
          </p>
        </div>
      </div>

      <div>
        <p className="font-michroma text-[7px] uppercase text-white/40 lg:text-[10px]">
          Team Identity
        </p>

        <p
          className="font-michroma text-[10px] lg:text-sm"
          style={{ color: `${scoutArchetypeColor}bb` }}
        >
          {teamIdentity}
        </p>
      </div>
    </>
  );
}
