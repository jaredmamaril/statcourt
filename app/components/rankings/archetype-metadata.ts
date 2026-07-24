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
  "Two-Way Superstar": {
    description:
      "Combines elite scoring responsibility with high-level defensive impact and star-level influence.",
    coreTraits: ["Elite Scoring", "Defensive Impact", "Star Control"],
    rarity: "gold",
    statBars: { scoring: 9, rebounding: 7, playmaking: 6, shooting: 6 },
  },

  "Offensive Hub": {
    description:
      "Serves as the center of the offense through scoring, passing, efficiency, and constant decision-making.",
    coreTraits: [
      "Offense Orchestrator",
      "Efficient Creator",
      "Scoring Pressure",
    ],
    rarity: "purple",
    statBars: { scoring: 8, rebounding: 6, playmaking: 9, shooting: 6 },
  },

  "Three-Level Scorer": {
    description:
      "Threatens defenses from the rim, midrange, and three-point line with efficient scoring versatility.",
    coreTraits: ["Shot Creation", "Shooting Touch", "Scoring Versatility"],
    rarity: "blue",
    statBars: { scoring: 9, rebounding: 5, playmaking: 5, shooting: 9 },
  },

  "Playmaking Big": {
    description:
      "Uses frontcourt size with passing skill, rebounding, and scoring touch to create offense from unusual spots.",
    coreTraits: ["Frontcourt Passing", "Interior Skill", "Offensive Feel"],
    rarity: "blue",
    statBars: { scoring: 7, rebounding: 8, playmaking: 8, shooting: 5 },
  },

  "Point Forward": {
    description:
      "Creates offense from the forward spot through size, scoring pressure, passing, and matchup control.",
    coreTraits: ["Wing Creation", "Passing Size", "Versatile Offense"],
    rarity: "blue",
    statBars: { scoring: 8, rebounding: 7, playmaking: 8, shooting: 6 },
  },

  "Defensive Anchor": {
    description:
      "Protects the defense through size, rebounding, interior presence, and high-level defensive value.",
    coreTraits: ["Paint Defense", "Rebounding Support", "Backline Control"],
    rarity: "blue",
    statBars: { scoring: 5, rebounding: 9, playmaking: 3, shooting: 2 },
  },

  "Rim Pressure Guard": {
    description:
      "Attacks downhill from the backcourt, creating paint touches, finishing pressure, and defensive collapse.",
    coreTraits: ["Downhill Scoring", "Paint Pressure", "Guard Creation"],
    rarity: "blue",
    statBars: { scoring: 8, rebounding: 4, playmaking: 6, shooting: 5 },
  },

  "Scoring Lead Guard": {
    description:
      "Controls the ball as a primary guard while creating offense mainly through scoring pressure.",
    coreTraits: ["Primary Ball Handler", "Shot Creation", "Scoring Pressure"],
    rarity: "blue",
    statBars: { scoring: 9, rebounding: 4, playmaking: 7, shooting: 7 },
  },

  "Lead Creator": {
    description:
      "Runs the offense through a blend of scoring, playmaking, pace control, and primary guard responsibility.",
    coreTraits: ["Primary Creation", "Ball Control", "Scoring Playmaker"],
    rarity: "blue",
    statBars: { scoring: 8, rebounding: 4, playmaking: 8, shooting: 6 },
  },

  "Two-Way Wing": {
    description:
      "Provides wing scoring with strong defensive value and matchup flexibility.",
    coreTraits: ["Wing Defense", "Scoring Pressure", "Matchup Versatility"],
    rarity: "blue",
    statBars: { scoring: 8, rebounding: 6, playmaking: 4, shooting: 6 },
  },

  "Wing Shot Creator": {
    description:
      "Creates offense from the wing through scoring volume, self-created shots, and reliable efficiency.",
    coreTraits: ["Wing Scoring", "Self-Creation", "Shot Pressure"],
    rarity: "blue",
    statBars: { scoring: 8, rebounding: 5, playmaking: 5, shooting: 7 },
  },

  "Clutch Creator": {
    description:
      "Creates efficient offense as a lead guard with scoring confidence and late-possession value.",
    coreTraits: ["Late-Clock Creation", "Scoring Control", "Guard Efficiency"],
    rarity: "blue",
    statBars: { scoring: 8, rebounding: 4, playmaking: 7, shooting: 7 },
  },

  "Two-Way Connector": {
    description:
      "Links scoring, passing, rebounding, and defense into a versatile forward role.",
    coreTraits: ["Versatile Forward", "Defensive Value", "All-Around Support"],
    rarity: "blue",
    statBars: { scoring: 7, rebounding: 7, playmaking: 6, shooting: 5 },
  },

  "Crafty Scoring Guard": {
    description:
      "Scores efficiently from the guard spot through skill, control, touch, and ball-handling craft.",
    coreTraits: ["Scoring Craft", "Ball Control", "Efficient Guard Play"],
    rarity: "blue",
    statBars: { scoring: 7, rebounding: 3, playmaking: 6, shooting: 7 },
  },

  "Small Sample Player": {
    description:
      "Has limited games or minutes, making the profile harder to judge with full confidence.",
    coreTraits: ["Limited Sample", "Developing Profile", "Unclear Role"],
    rarity: "gray",
    statBars: { scoring: 3, rebounding: 3, playmaking: 3, shooting: 3 },
  },

  "Combo Guard": {
    description:
      "Blends backcourt scoring with secondary playmaking and flexible guard responsibilities.",
    coreTraits: [
      "Scoring Guard",
      "Secondary Creation",
      "Backcourt Flexibility",
    ],
    rarity: "gray",
    statBars: { scoring: 6, rebounding: 3, playmaking: 6, shooting: 5 },
  },

  "Reserve Playmaker": {
    description:
      "Provides passing, ball handling, and offensive organization in a smaller guard role.",
    coreTraits: ["Passing Depth", "Ball Handling", "Second-Unit Control"],
    rarity: "gray",
    statBars: { scoring: 4, rebounding: 3, playmaking: 7, shooting: 4 },
  },

  "Bench Scorer": {
    description:
      "Adds useful scoring punch from the backcourt without carrying a primary offensive role.",
    coreTraits: ["Bench Offense", "Shot Creation", "Scoring Spark"],
    rarity: "gray",
    statBars: { scoring: 6, rebounding: 3, playmaking: 4, shooting: 5 },
  },

  "Spot-Up Guard": {
    description:
      "Spaces the floor from the guard spot with catch-and-shoot value and low-usage scoring.",
    coreTraits: ["Spot-Up Shooting", "Floor Spacing", "Low-Usage Offense"],
    rarity: "gray",
    statBars: { scoring: 4, rebounding: 2, playmaking: 3, shooting: 7 },
  },

  "Backup Ball Handler": {
    description:
      "Provides secondary handling and passing support in a limited backcourt role.",
    coreTraits: ["Ball Security", "Passing Support", "Guard Depth"],
    rarity: "gray",
    statBars: { scoring: 3, rebounding: 2, playmaking: 6, shooting: 4 },
  },

  "Reserve Scoring Guard": {
    description:
      "Contributes scoring as a smaller-role guard who can provide offensive lift off the bench.",
    coreTraits: ["Guard Scoring", "Rotation Offense", "Shot Making"],
    rarity: "gray",
    statBars: { scoring: 5, rebounding: 2, playmaking: 3, shooting: 5 },
  },

  "Rebounding Guard": {
    description:
      "Adds unusual rebounding value from the guard position and helps finish possessions.",
    coreTraits: ["Backcourt Rebounding", "Activity", "Possession Value"],
    rarity: "gray",
    statBars: { scoring: 4, rebounding: 6, playmaking: 4, shooting: 4 },
  },

  "Low-Usage Shooter": {
    description:
      "Provides occasional shooting value without needing many touches or offensive possessions.",
    coreTraits: ["Low Usage", "Shooting Support", "Spacing Value"],
    rarity: "gray",
    statBars: { scoring: 3, rebounding: 2, playmaking: 2, shooting: 6 },
  },

  "Depth Ball Handler": {
    description:
      "Adds basic guard handling and passing value in limited minutes or a depth role.",
    coreTraits: ["Depth Guard", "Basic Creation", "Ball Handling"],
    rarity: "gray",
    statBars: { scoring: 3, rebounding: 2, playmaking: 5, shooting: 3 },
  },

  "Low-Minute Scoring Guard": {
    description:
      "Provides occasional backcourt scoring in limited minutes or a small offensive role.",
    coreTraits: ["Limited Minutes", "Scoring Flashes", "Guard Depth"],
    rarity: "gray",
    statBars: { scoring: 4, rebounding: 2, playmaking: 2, shooting: 4 },
  },

  "Depth Guard": {
    description:
      "Backcourt depth profile with limited statistical impact but useful rotation support.",
    coreTraits: ["Guard Depth", "Limited Role", "Support Minutes"],
    rarity: "gray",
    statBars: { scoring: 2, rebounding: 2, playmaking: 3, shooting: 3 },
  },

  "Rotation Wing": {
    description:
      "Provides enough scoring and rebounding from the wing to fit regular rotation minutes.",
    coreTraits: ["Wing Scoring", "Rebounding Support", "Rotation Value"],
    rarity: "gray",
    statBars: { scoring: 5, rebounding: 5, playmaking: 3, shooting: 4 },
  },

  "Floor-Spacing Forward": {
    description:
      "Stretches defenses from the forward spot with shooting value and frontcourt size.",
    coreTraits: ["Forward Spacing", "Perimeter Shooting", "Off-Ball Value"],
    rarity: "gray",
    statBars: { scoring: 4, rebounding: 4, playmaking: 2, shooting: 7 },
  },

  "Rebounding Forward": {
    description:
      "Impacts the game through forward-size rebounding, physical activity, and possession support.",
    coreTraits: ["Forward Rebounding", "Activity", "Physical Role"],
    rarity: "gray",
    statBars: { scoring: 4, rebounding: 7, playmaking: 2, shooting: 3 },
  },

  "Defensive Wing": {
    description:
      "Adds defensive value from the wing with enough supporting production to stay useful.",
    coreTraits: ["Wing Defense", "Matchup Coverage", "Support Role"],
    rarity: "gray",
    statBars: { scoring: 3, rebounding: 4, playmaking: 2, shooting: 3 },
  },

  "Reserve Wing Scorer": {
    description:
      "Provides wing scoring in a smaller rotation role without primary offensive responsibility.",
    coreTraits: ["Wing Scoring", "Bench Offense", "Rotation Role"],
    rarity: "gray",
    statBars: { scoring: 5, rebounding: 3, playmaking: 2, shooting: 4 },
  },

  "Energy Forward": {
    description:
      "Contributes through activity, rebounding, physicality, and effort-based frontcourt minutes.",
    coreTraits: ["Energy Role", "Rebounding Activity", "Physical Play"],
    rarity: "gray",
    statBars: { scoring: 3, rebounding: 6, playmaking: 2, shooting: 2 },
  },

  "Spot-Up Wing": {
    description:
      "Provides wing spacing through spot-up shooting and low-usage perimeter value.",
    coreTraits: ["Wing Shooting", "Floor Spacing", "Off-Ball Role"],
    rarity: "gray",
    statBars: { scoring: 3, rebounding: 3, playmaking: 2, shooting: 6 },
  },

  "Low-Usage Stretch Wing": {
    description:
      "Offers limited-usage wing minutes with some ability to space the floor.",
    coreTraits: ["Low Usage", "Stretch Wing", "Spacing Support"],
    rarity: "gray",
    statBars: { scoring: 3, rebounding: 3, playmaking: 2, shooting: 5 },
  },

  "Activity Forward": {
    description:
      "Adds size, movement, rebounding support, and activity in a smaller forward role.",
    coreTraits: ["Activity", "Forward Depth", "Rebounding Support"],
    rarity: "gray",
    statBars: { scoring: 3, rebounding: 5, playmaking: 2, shooting: 2 },
  },

  "Low-Minute Wing Scorer": {
    description:
      "Provides occasional scoring flashes from the wing in limited minutes.",
    coreTraits: ["Limited Minutes", "Wing Scoring", "Depth Role"],
    rarity: "gray",
    statBars: { scoring: 4, rebounding: 3, playmaking: 2, shooting: 3 },
  },

  "Depth Wing": {
    description:
      "Wing depth profile with limited usage but enough size and activity to support a roster.",
    coreTraits: ["Wing Depth", "Support Minutes", "Limited Role"],
    rarity: "gray",
    statBars: { scoring: 2, rebounding: 3, playmaking: 2, shooting: 3 },
  },

  "Rim-Running Big": {
    description:
      "Finishes around the basket, rebounds, screens, and creates value through interior movement.",
    coreTraits: ["Rim Running", "Interior Finishing", "Rebounding Activity"],
    rarity: "gray",
    statBars: { scoring: 5, rebounding: 7, playmaking: 2, shooting: 1 },
  },

  "Glass-Cleaning Big": {
    description:
      "Adds value through rebounding volume, physical interior play, and possession control.",
    coreTraits: ["Rebounding", "Interior Physicality", "Possession Work"],
    rarity: "gray",
    statBars: { scoring: 3, rebounding: 8, playmaking: 2, shooting: 1 },
  },

  "Rim Protector": {
    description:
      "Protects the paint through shot-blocking, size, and interior defensive positioning.",
    coreTraits: ["Shot Blocking", "Paint Defense", "Interior Presence"],
    rarity: "gray",
    statBars: { scoring: 3, rebounding: 6, playmaking: 1, shooting: 1 },
  },

  "Defensive Big": {
    description:
      "Frontcourt defender who provides interior support, physicality, and defensive stability.",
    coreTraits: ["Interior Defense", "Frontcourt Support", "Physical Role"],
    rarity: "gray",
    statBars: { scoring: 3, rebounding: 6, playmaking: 2, shooting: 1 },
  },

  "Interior Finisher": {
    description:
      "Scores efficiently near the basket through cuts, rolls, putbacks, and close-range touches.",
    coreTraits: ["Interior Scoring", "Efficient Finishing", "Low-Post Touches"],
    rarity: "gray",
    statBars: { scoring: 4, rebounding: 5, playmaking: 1, shooting: 1 },
  },

  "Backup Big": {
    description:
      "Provides size, rebounding, finishing, and interior minutes in a reserve frontcourt role.",
    coreTraits: ["Frontcourt Depth", "Rebounding Support", "Interior Minutes"],
    rarity: "gray",
    statBars: { scoring: 3, rebounding: 6, playmaking: 1, shooting: 1 },
  },

  "Reserve Interior Scorer": {
    description:
      "Adds scoring from the center spot in a smaller role through interior touches and finishing.",
    coreTraits: ["Interior Scoring", "Reserve Role", "Paint Touches"],
    rarity: "gray",
    statBars: { scoring: 4, rebounding: 4, playmaking: 1, shooting: 1 },
  },

  "Depth Big": {
    description:
      "Frontcourt depth profile with limited production but useful size and interior support.",
    coreTraits: ["Big Depth", "Interior Support", "Limited Role"],
    rarity: "gray",
    statBars: { scoring: 2, rebounding: 4, playmaking: 1, shooting: 1 },
  },

  "Depth Contributor": {
    description:
      "General depth profile with limited statistical production and a smaller support role.",
    coreTraits: ["Depth Role", "Limited Usage", "Roster Support"],
    rarity: "gray",
    statBars: { scoring: 2, rebounding: 2, playmaking: 2, shooting: 2 },
  },
} satisfies Record<string, ArchetypeMetadata>;
