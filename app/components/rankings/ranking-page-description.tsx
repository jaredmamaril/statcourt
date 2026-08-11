import type { RankingTab } from "./ranking-tabs";

type RankingPageDescriptionProps = {
  activeTab: RankingTab;
};

export function RankingPageDescription({
  activeTab,
}: RankingPageDescriptionProps) {
  const description =
    activeTab === "archetypes"
      ? "Study each player identity class, from generational skills to elite traits, and see the top players who define every archetype."
      : "Explore leaderboard tabs, filter by team or position, and see which players lead each statistical category.";

  return (
    <p className="mx-auto mt-2 max-w-70 text-center font-michroma text-[9px] leading-relaxed text-white/65 sm:max-w-3xl sm:text-xs">
      {description}
    </p>
  );
}

