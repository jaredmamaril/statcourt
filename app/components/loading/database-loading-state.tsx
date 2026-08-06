import { PlayerListSkeleton, SkeletonBlock } from "./skeleton";

type DatabaseLoadingStateProps = {
  title?: string;
  description?: string;
  skeleton?: "player-cards" | "player-rows";
};

export function DatabaseLoadingState({
  skeleton,
}: DatabaseLoadingStateProps) {
  if (skeleton) {
    return (
      <div className="mx-auto mt-5 w-full lg:mt-8">
        <PlayerListSkeleton
          variant={skeleton === "player-rows" ? "rows" : "cards"}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto mt-5 w-full max-w-sm rounded-md border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-3 lg:mt-8 lg:p-5">
      <SkeletonBlock className="h-3 w-40" />
      <SkeletonBlock className="mt-3 h-2 w-56 max-w-full" />
      <SkeletonBlock className="mt-4 h-1.5 w-full" />
    </div>
  );
}
