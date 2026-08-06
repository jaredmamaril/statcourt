import { SkeletonBlock } from "../../loading/skeleton";

function SnapshotSkeleton() {
  return (
    <div className="absolute -left-58 top-4 z-500 hidden w-64 font-michroma uppercase text-center xl:block">
      <SkeletonBlock className="mx-auto h-3 w-34" />

      <div className="mt-2 rounded-md border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-3">
        <SkeletonBlock className="mx-auto h-2 w-28" />
        <SkeletonBlock className="mx-auto mt-2 h-6 w-16" />

        <div className="mt-3 border-t border-white/10 pt-3">
          <SkeletonBlock className="mx-auto h-2 w-24" />
          <div className="mx-auto mt-3 grid max-w-32 grid-cols-3 gap-3">
            {["G", "F", "C"].map((position) => (
              <div key={position}>
                <SkeletonBlock className="mx-auto h-2 w-5" />
                <SkeletonBlock className="mx-auto mt-2 h-2.5 w-8" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          <SkeletonBlock className="mx-auto h-2 w-26" />
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center justify-between gap-2">
              <SkeletonBlock className="h-2 w-28" />
              <SkeletonBlock className="h-2 w-6" />
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item}>
              <SkeletonBlock className="mx-auto h-2 w-24" />
              <SkeletonBlock className="mx-auto mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="absolute -right-58 top-4 hidden w-64 text-center font-michroma uppercase xl:block">
      <div className="mt-2 rounded-md border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-3">
        <SkeletonBlock className="mx-auto h-2 w-28" />
        <SkeletonBlock className="mx-auto mt-3 h-4 w-36" />
        <SkeletonBlock className="mx-auto mt-2 h-3 w-16" />
        <SkeletonBlock className="mx-auto mt-2 h-2 w-22" />

        <div className="mt-3 flex flex-col items-center gap-1">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="h-5 w-28" />
          <SkeletonBlock className="h-5 w-30" />
        </div>

        <SkeletonBlock className="mx-auto mt-3 h-7 w-28" />
      </div>

      <div className="mt-4 rounded-md border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-3">
        <SkeletonBlock className="mx-auto h-2 w-28" />

        <div className="mt-3 flex flex-col gap-2">
          {[0, 1, 2].map((item) => (
            <SkeletonBlock key={item} className="h-7 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PlayerDashboardSkeleton() {
  return (
    <>
      <SnapshotSkeleton />
      <FeaturedSkeleton />
    </>
  );
}
