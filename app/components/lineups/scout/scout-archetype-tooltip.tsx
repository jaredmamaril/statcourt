import { useState } from "react";
import { archetypeColorLegend } from "../shared/lineup-style-helpers";

type ScoutArchetypeTooltipProps = {
  scoutArchetypeColor: string;
};

export function ScoutArchetypeTooltip({
  scoutArchetypeColor,
}: ScoutArchetypeTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="group/archetype relative z-900 flex w-fit cursor-help items-center gap-2"
      onClick={() => setIsOpen((current) => !current)}
    >
      <p className="font-michroma text-[10px] uppercase text-white/40">
        Archetype
      </p>

      <div className="flex items-center gap-1">
        <span
          className="flex h-2 w-2 rounded-full"
          style={{ backgroundColor: scoutArchetypeColor }}
        />
        <span className="mt-0.5 text-[7px] text-white/40 lg:text-[8px]">
          <span className="lg:hidden">Click me</span>
          <span className="hidden lg:inline">Hover over me</span>
        </span>
      </div>

      <div
        className={`absolute left-0 top-full z-999 mt-2 w-44 rounded-md border border-white/15 bg-black/95 p-1.5 shadow-[0_0_24px_rgba(0,0,0,0.55)] transition-opacity duration-200 lg:left-full lg:-top-20 lg:ml-3 lg:mt-0 lg:w-80 lg:p-3 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0 group-hover/archetype:pointer-events-auto group-hover/archetype:opacity-100"
        }`}
      >
        <p className="font-michroma text-[7px] uppercase text-white/60 lg:text-[10px]">
          Archetype Colors
        </p>

        <div className="mt-1.5 grid gap-1 lg:mt-3 lg:gap-2">
          {archetypeColorLegend.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[7px_1fr] gap-1 lg:grid-cols-[10px_1fr] lg:gap-2"
            >
              <span
                className="mt-0.5 h-1.5 w-1.5 rounded-full lg:mt-1 lg:h-2 lg:w-2"
                style={{ backgroundColor: item.color }}
              />

              <div>
                <p className="font-michroma text-[6.5px] text-white lg:text-[9px]">
                  {item.label}
                </p>
                <p className="mt-0.5 font-michroma text-[5.8px] leading-snug text-white/40 lg:text-[8px] lg:leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
