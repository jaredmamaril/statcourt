import { SkeletonBlock } from "../loading/skeleton";
import type { DefaultPlayerView } from "../../lib/use-user-settings";

function RankingFilterSkeleton() {
  return (
    <div className="mx-auto mt-3 flex max-w-4xl flex-wrap items-center justify-center gap-1.5 lg:mt-4 lg:gap-2">
      {[72, 90, 90, 110, 74].map((width, index) => (
        <SkeletonBlock
          key={index}
          className="h-8 rounded-md lg:h-10"
          style={{ width }}
        />
      ))}

      <SkeletonBlock className="h-8 w-40 rounded-md lg:h-10 lg:w-64" />
    </div>
  );
}

function TopRankingCardSkeleton() {
  return (
    <div className="min-w-0 rounded-md border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] px-1.5 py-2 lg:px-4 lg:py-3">
      <div className="flex items-center justify-between gap-1">
        <SkeletonBlock className="h-3 w-8" />
        <SkeletonBlock className="h-4 w-10 lg:h-6 lg:w-14" />
      </div>

      <SkeletonBlock className="mt-2 h-3 w-20 lg:h-5 lg:w-32" />
      <SkeletonBlock className="mt-2 h-5 w-17 lg:w-36" />
      <SkeletonBlock className="mt-2 h-2 w-8 lg:w-12" />
      <SkeletonBlock className="mt-1 h-2 w-5 lg:w-8" />

      <SkeletonBlock className="mx-auto mt-2 h-13 w-13 rounded-md lg:h-30 lg:w-30" />
    </div>
  );
}

function RemainingCardSkeleton() {
  return (
    <div className="rounded-md border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-2 lg:p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="h-3 w-8" />
          <SkeletonBlock className="mt-2 h-3 w-28" />
          <SkeletonBlock className="mt-2 h-5 w-24" />
          <SkeletonBlock className="mt-2 h-2 w-14" />
        </div>

        <SkeletonBlock className="h-5 w-11" />
      </div>
    </div>
  );
}

function RemainingRowSkeleton() {
  return (
    <div className="rounded-md border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-2 lg:p-3">
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-4 w-8" />
        <SkeletonBlock className="h-10 w-10 rounded-md" />
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="h-3 w-32 max-w-full" />
          <SkeletonBlock className="mt-2 h-2 w-20" />
        </div>
        <SkeletonBlock className="h-4 w-12" />
      </div>
    </div>
  );
}

export function RankingLeaderboardSkeleton({
  displayView,
}: {
  displayView: DefaultPlayerView;
}) {
  const isCardView = displayView === "cards";

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <SkeletonBlock className="h-5 w-54 lg:h-7 lg:w-92" />
        <SkeletonBlock className="h-5 w-5 rounded-full" />
      </div>

      <RankingFilterSkeleton />

      <div className="mt-3 grid grid-cols-3 gap-2 lg:gap-5">
        {[0, 1, 2].map((item) => (
          <TopRankingCardSkeleton key={item} />
        ))}
      </div>

      <div className="mt-8 mb-1.5 flex items-center justify-between px-1.5 lg:mb-2 lg:px-3">
        <SkeletonBlock className="h-2.5 w-32" />
        <SkeletonBlock className="h-2.5 w-12" />
      </div>

      <div
        className={
          isCardView
            ? "grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-2"
            : "grid grid-cols-1 gap-1.5 lg:grid-cols-2 lg:gap-2"
        }
      >
        {Array.from({ length: isCardView ? 8 : 6 }, (_, index) =>
          isCardView ? (
            <RemainingCardSkeleton key={index} />
          ) : (
            <RemainingRowSkeleton key={index} />
          ),
        )}
      </div>
    </>
  );
}

export function RankingArchetypesSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col items-center gap-2">
        <SkeletonBlock className="h-5 w-52 lg:h-7 lg:w-80" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-8 w-28 rounded-md" />
          <SkeletonBlock className="h-8 w-28 rounded-md" />
        </div>
      </div>

      <div className="mt-5 grid max-h-104 gap-2 overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }, (_, index) => (
          <div
            key={index}
            className="rounded-md border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-4 w-8" />
            </div>
            <SkeletonBlock className="mt-3 h-2.5 w-full" />
            <SkeletonBlock className="mt-2 h-2.5 w-3/4" />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <SkeletonBlock className="h-3 w-38 lg:w-48" />
        <SkeletonBlock className="h-8 w-28 rounded-md lg:h-9 lg:w-32" />
      </div>

      <div className="mt-7 rounded-md border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-4 text-center lg:p-5">
        <SkeletonBlock className="mx-auto h-4 w-62 max-w-full lg:h-5 lg:w-96" />
        <SkeletonBlock className="mx-auto mt-4 h-3 w-52 max-w-full lg:w-72" />
      </div>
    </div>
  );
}
