import { getPlayerInsights } from "../court-data";

export function getArchetypePillStyle(
  archetype: NonNullable<ReturnType<typeof getPlayerInsights>["archetype"]>,
) {
  const color =
    archetype.rarity === "gold"
      ? "#EFBF04"
      : archetype.rarity === "purple"
        ? "#A855F7"
        : archetype.rarity === "blue"
          ? "#38BDF8"
          : archetype.rarity === "red"
            ? "#EF4444"
            : "#94A3B8";

  return {
    color,
    borderColor: `${color}99`,
    backgroundColor: `${color}22`,
  };
}
