import { archetypeColorLegend } from "../shared/lineup-style-helpers";

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
        <div>
          <div className="group/archetype relative z-900 flex w-fit items-center gap-2">
            <p className="font-michroma text-[10px] uppercase text-white/40">
              Archetype
            </p>

            <div className="flex items-center gap-1">
              <span
                className="flex h-2 w-2 rounded-full"
                style={{ backgroundColor: scoutArchetypeColor }}
              />
              <span className="mt-0.5 text-[8px] text-white/40">
                Hover over me!
              </span>
            </div>

            <div className="pointer-events-none absolute left-full -top-20 z-999 ml-3 w-80 rounded-md border border-white/15 bg-black/95 p-3 opacity-0 shadow-[0_0_24px_rgba(0,0,0,0.55)] transition-opacity duration-200 group-hover/archetype:pointer-events-auto group-hover/archetype:opacity-100">
              <p className="font-michroma text-[10px] uppercase text-white/60">
                Archetype Colors
              </p>

              <div className="mt-3 grid gap-2">
                {archetypeColorLegend.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[10px_1fr] gap-2"
                  >
                    <span
                      className="mt-1 h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />

                    <div>
                      <p className="font-michroma text-[9px] text-white">
                        {item.label}
                      </p>
                      <p className="mt-0.5 font-michroma text-[8px] leading-relaxed text-white/40">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p
            className="font-michroma text-sm"
            style={{
              color: scoutArchetypeColor,
              textShadow: `0 0 10px ${scoutArchetypeColor}88`,
            }}
          >
            {lineupArchetype}
          </p>
        </div>

        <div>
          <p className="mt-1 font-michroma text-[10px] uppercase text-white/40">
            Why This Archetype
          </p>

          <p className="mt-1 max-w-75 font-michroma text-[9px] leading-relaxed text-white/45">
            {scoutReason}
          </p>
        </div>
      </div>

      <div>
        <p className="font-michroma text-[10px] uppercase text-white/40">
          Team Identity
        </p>

        <p
          className="font-michroma text-sm"
          style={{ color: `${scoutArchetypeColor}bb` }}
        >
          {teamIdentity}
        </p>
      </div>
    </>
  );
}
