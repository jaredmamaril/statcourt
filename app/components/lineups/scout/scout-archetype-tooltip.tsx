import { useEffect, useRef, useState } from "react";
import { archetypeColorLegend } from "../shared/lineup-style-helpers";

type ScoutArchetypeTooltipProps = {
  scoutArchetypeColor: string;
};

export function ScoutArchetypeTooltip({
  scoutArchetypeColor,
}: ScoutArchetypeTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const tooltipId = "scout-archetype-color-tooltip";

  useEffect(() => {
    function closeTooltip(event: PointerEvent | KeyboardEvent) {
      if (!isOpen) return;

      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setIsOpen(false);
        return;
      }

      if (!(event.target instanceof Node)) return;
      if (tooltipRef.current?.contains(event.target)) return;

      setIsOpen(false);
    }

    document.addEventListener("pointerdown", closeTooltip);
    document.addEventListener("keydown", closeTooltip);

    return () => {
      document.removeEventListener("pointerdown", closeTooltip);
      document.removeEventListener("keydown", closeTooltip);
    };
  }, [isOpen]);

  return (
    <div
      ref={tooltipRef}
      className="group/archetype relative z-900 flex w-fit cursor-help items-center gap-2"
    >
      <p className="font-michroma text-[10px] uppercase text-white/40">
        Archetype
      </p>

      <button
        type="button"
        aria-controls={tooltipId}
        aria-describedby={tooltipId}
        aria-expanded={isOpen}
        aria-label="Archetype color legend"
        onClick={() => setIsOpen((current) => !current)}
        onFocus={() => setIsOpen(true)}
        className="flex items-center gap-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--court-accent)]"
      >
        <span
          aria-hidden="true"
          className="flex h-2 w-2 rounded-full"
          style={{ backgroundColor: scoutArchetypeColor }}
        />
        <span className="mt-0.5 text-[8px] text-white/60 lg:text-[9px]">
          <span className="lg:hidden">Click me</span>
          <span className="hidden lg:inline">Hover over me</span>
        </span>
      </button>

      <div
        id={tooltipId}
        role="tooltip"
        className={`statcourt-scroll absolute left-0 top-full z-999 mt-2 max-h-50 w-44 overflow-y-auto rounded-md border border-white/15 bg-black/95 p-1.5 shadow-[0_0_24px_rgba(0,0,0,0.55)] transition-opacity duration-200 lg:left-full lg:-top-20 lg:ml-0 lg:mt-0 lg:max-h-80 lg:w-80 lg:p-3 ${
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
                <p className="mt-0.5 font-michroma text-[8px] leading-snug text-white/65 lg:text-[9px] lg:leading-relaxed">
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
