"use client";

import { Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  PlayerRatingCategory,
  PlayerStatProfileMode,
} from "../player-ratings";

type RankingRatingFormulaTooltipProps = {
  ratingCategory: PlayerRatingCategory;
  statProfileFilter: PlayerStatProfileMode;
};

const statProfileLabels: Record<PlayerStatProfileMode, string> = {
  career: "Career",
  peak: "3-Year Peak",
  current: "Latest Season",
};

function getFormulaText(
  ratingCategory: PlayerRatingCategory,
  statProfileFilter: PlayerStatProfileMode,
) {
  const profileLabel = statProfileLabels[statProfileFilter];

  if (ratingCategory === "careerOverall") {
    return {
      title: "Career Overall",
      description:
        "Career OVR blends career scoring, defense, playmaking, efficiency, shooting, rebounding, star power, and career legacy. It also adds a small versatility bonus and protects elite historical resumes with a legacy floor.",
    };
  }

  if (ratingCategory === "peakOverall") {
    return {
      title: "3-Year Peak Overall",
      description:
        "Peak OVR uses the player's best three-year profile. It weights scoring and playmaking more heavily, keeps defense important, adds a small star/legacy influence, and rewards the player's best standout skill.",
    };
  }

  if (ratingCategory === "currentOverall") {
    return {
      title: "Latest Season Overall",
      description:
        "Latest Season OVR uses the most recent season profile. It focuses on current scoring, defense, playmaking, efficiency, shooting, rebounding, and star power with only a small career legacy influence.",
    };
  }

  if (ratingCategory === "scoring") {
    return {
      title: `${profileLabel} Scoring`,
      description:
        "Scoring is based on points per game for the selected stat profile, normalized against an elite scoring benchmark.",
    };
  }

  if (ratingCategory === "shooting") {
    return {
      title: `${profileLabel} Shooting`,
      description:
        "Shooting uses three-point percentage, free-throw percentage, and three-point attempt volume when available. Players need enough sample and stable shooting history so low-volume hot seasons do not dominate.",
    };
  }

  if (ratingCategory === "playmaking") {
    return {
      title: `${profileLabel} Playmaking`,
      description:
        "Playmaking is based on assists per game for the selected profile, normalized against an elite creation benchmark.",
    };
  }

  if (ratingCategory === "rebounding") {
    return {
      title: `${profileLabel} Rebounding`,
      description:
        "Rebounding is based on rebounds per game for the selected profile, normalized against an elite rebounding benchmark.",
    };
  }

  if (ratingCategory === "defense") {
    return {
      title: "Defense",
      description:
        "Defense uses the player's stored defensive rating. It does not change by Career, Peak, or Latest Season yet.",
    };
  }

  if (ratingCategory === "efficiency") {
    return {
      title: `${profileLabel} Efficiency`,
      description:
        "Efficiency uses field-goal percentage, free-throw percentage, real three-point shooting volume when available, and scoring volume for the selected profile. Tiny-sample three-point percentages do not count.",
    };
  }

  if (ratingCategory === "careerLegacy") {
    return {
      title: "Career Legacy",
      description:
        "Career Legacy comes from the player's historical resume: awards, championships, longevity, regular-season production, and playoff resume.",
    };
  }

  return {
    title: "Star Power",
    description:
      "Star Power estimates superstar presence using scoring, creation, shooting gravity, longevity, name value, and a small career legacy boost.",
  };
}

export function RankingRatingFormulaTooltip({
  ratingCategory,
  statProfileFilter,
}: RankingRatingFormulaTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const formula = getFormulaText(ratingCategory, statProfileFilter);
  const tooltipId = `ranking-formula-tooltip-${ratingCategory}-${statProfileFilter}`;

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
    <div ref={tooltipRef} className="group relative inline-flex">
      <button
        type="button"
        aria-describedby={tooltipId}
        aria-expanded={isOpen}
        aria-controls={tooltipId}
        aria-label={`${formula.title} calculation info`}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((current) => !current);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="inline-flex min-h-9 min-w-9 cursor-help items-center justify-center rounded-full border border-[rgb(var(--court-accent-rgb)/0.45)] bg-black/35 text-[var(--court-accent)] transition hover:border-[var(--court-accent)] hover:bg-[rgb(var(--court-accent-rgb)/0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--court-accent)] lg:min-h-10 lg:min-w-10"
      >
        <Info aria-hidden="true" className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
      </button>

      <div
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none fixed top-24 left-3 right-3 z-[999] rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-black/95 p-2.5 text-left font-michroma shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.18)] transition-opacity duration-150 sm:absolute sm:top-full sm:right-auto sm:left-1/2 sm:mt-2 sm:w-72 sm:max-w-[calc(100vw-2rem)] sm:-translate-x-1/2 lg:w-76 lg:p-3 ${
          isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <p className="text-[8px] uppercase text-[var(--court-accent)] lg:text-[10px]">
          {formula.title}
        </p>

        <p className="mt-1.5 text-[7px] leading-relaxed text-white/70 lg:text-[9px]">
          {formula.description}
        </p>
      </div>
    </div>
  );
}

