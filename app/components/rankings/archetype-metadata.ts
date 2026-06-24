import type { PlayerInsightDisplay } from "../court-data";

type ArchetypeRarity = PlayerInsightDisplay["rarity"];

type ArchetypeStatBars = {
  scoring: number;
  rebounding: number;
  playmaking: number;
  shooting: number;
};

type ArchetypeMetadata = {
  description: string;
  coreTraits: string[];
  rarity: ArchetypeRarity;
  statBars: ArchetypeStatBars;
};

export const archetypeInfoByLabel = {
  "Generational Shooter": {
    description:
      "Transforms offensive spacing through elite perimeter shooting and high-volume scoring gravity.",
    coreTraits: [
      "Elite Perimeter Shooter",
      "Automatic at the Line",
      "Scoring Gravity",
    ],
    rarity: "gold",
    statBars: { scoring: 9, rebounding: 3, playmaking: 6, shooting: 10 },
  },
  "Generational Scorer": {
    description:
      "Produces all-time scoring volume and bends defensive game plans through constant shot pressure.",
    coreTraits: [
      "Elite Shot Creator",
      "High-Usage Offensive Focus",
      "Scoring Volume",
    ],
    rarity: "gold",
    statBars: { scoring: 10, rebounding: 5, playmaking: 5, shooting: 7 },
  },
  "Generational Creator": {
    description:
      "Controls possessions through elite passing vision, offensive command, and teammate creation.",
    coreTraits: ["Floor General", "Elite Playmaker", "Offense Orchestrator"],
    rarity: "gold",
    statBars: { scoring: 6, rebounding: 5, playmaking: 10, shooting: 5 },
  },
  "Triple-Double Machine": {
    description:
      "Impacts every phase of the game through scoring, rebounding, and playmaking production.",
    coreTraits: [
      "All-Around Production",
      "Elite Playmaker",
      "Strong Rebounding Impact",
    ],
    rarity: "purple",
    statBars: { scoring: 8, rebounding: 9, playmaking: 9, shooting: 6 },
  },
  "Interior Anchor": {
    description:
      "Controls the paint through rebounding, interior efficiency, and physical presence.",
    coreTraits: ["Dominant Rebounder", "Paint Presence", "Interior Efficiency"],
    rarity: "purple",
    statBars: { scoring: 7, rebounding: 10, playmaking: 4, shooting: 2 },
  },
  "Historic Rebounding": {
    description:
      "Creates a historic possession advantage through elite rebounding dominance.",
    coreTraits: ["Dominant Rebounder", "Second-Chance Value", "Paint Control"],
    rarity: "purple",
    statBars: { scoring: 6, rebounding: 10, playmaking: 3, shooting: 1 },
  },
  "Paint Dominator": {
    description:
      "Controls the interior through scoring, rebounding, and efficient finishing.",
    coreTraits: [
      "Dominant Rebounder",
      "Efficient Finisher",
      "Interior Scoring",
    ],
    rarity: "blue",
    statBars: { scoring: 8, rebounding: 10, playmaking: 3, shooting: 2 },
  },
  "Primary Scoring Engine": {
    description:
      "Carries offensive volume through elite shot creation and scoring pressure.",
    coreTraits: [
      "Elite Shot Creator",
      "Reliable Offensive Threat",
      "High-Usage Offensive Focus",
    ],
    rarity: "blue",
    statBars: { scoring: 9, rebounding: 5, playmaking: 5, shooting: 6 },
  },
  "Two-Way Threat": {
    description:
      "Pairs star-level scoring with major physical impact through rebounding and matchup versatility.",
    coreTraits: ["Scoring Pressure", "Rebounding Impact", "Versatile Profile"],
    rarity: "blue",
    statBars: { scoring: 8, rebounding: 8, playmaking: 5, shooting: 5 },
  },
  "Floor General": {
    description:
      "Runs the offense through elite passing, pace control, and efficient decision-making.",
    coreTraits: ["Elite Playmaker", "Offensive Control", "Decision-Making"],
    rarity: "blue",
    statBars: { scoring: 6, rebounding: 4, playmaking: 9, shooting: 5 },
  },
  "Balanced Star": {
    description:
      "Contributes across scoring, rebounding, playmaking, and efficiency without relying on one skill.",
    coreTraits: [
      "Versatile Production",
      "Efficient Scoring",
      "All-Around Impact",
    ],
    rarity: "blue",
    statBars: { scoring: 8, rebounding: 7, playmaking: 7, shooting: 7 },
  },
  "Post-Up Specialist": {
    description:
      "Creates offense from interior touches, physical positioning, and efficient close-range scoring.",
    coreTraits: ["Interior Scoring", "Efficient Finisher", "Paint Touches"],
    rarity: "blue",
    statBars: { scoring: 8, rebounding: 8, playmaking: 3, shooting: 2 },
  },
  "Stretch Big": {
    description:
      "Combines frontcourt size and rebounding with floor-spacing shooting value.",
    coreTraits: ["Floor Spacing", "Frontcourt Skill", "Rebounding Presence"],
    rarity: "blue",
    statBars: { scoring: 7, rebounding: 8, playmaking: 5, shooting: 8 },
  },
  "Volume Scorer": {
    description:
      "Carries a heavy scoring workload through shot volume, even without elite efficiency.",
    coreTraits: ["Scoring Volume", "Shot Creation", "High Usage"],
    rarity: "blue",
    statBars: { scoring: 9, rebounding: 4, playmaking: 4, shooting: 6 },
  },
  "Pure Point Guard": {
    description:
      "Creates value primarily through passing, tempo control, and organizing team offense.",
    coreTraits: ["Passing Control", "Floor General", "Team Creation"],
    rarity: "blue",
    statBars: { scoring: 4, rebounding: 4, playmaking: 9, shooting: 5 },
  },
  "Elite Shot Creator": {
    description:
      "Generates high-level scoring chances while maintaining strong offensive efficiency.",
    coreTraits: ["Shot Creation", "Scoring Pressure", "Self-Created Offense"],
    rarity: "blue",
    statBars: { scoring: 9, rebounding: 4, playmaking: 5, shooting: 7 },
  },
  "Elite Scorer": {
    description:
      "Produces star-level points with enough efficiency to lead an offense.",
    coreTraits: [
      "Scoring Volume",
      "Reliable Offensive Threat",
      "Shot Pressure",
    ],
    rarity: "blue",
    statBars: { scoring: 9, rebounding: 5, playmaking: 4, shooting: 7 },
  },
} satisfies Record<string, ArchetypeMetadata>;
