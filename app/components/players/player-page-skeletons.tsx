import { SkeletonBlock } from "../loading/skeleton";

export function PlayerPageControlsSkeleton() {
  return (
    <>
      <div className="mb-2 flex flex-col items-center justify-between gap-1">
        <SkeletonBlock className="h-6 w-44 sm:h-8 sm:w-64" />
        <SkeletonBlock className="h-2.5 w-64 max-w-full sm:h-3 sm:w-120" />
        <SkeletonBlock className="h-2.5 w-52 max-w-full sm:hidden" />
        <SkeletonBlock className="mt-1 h-8 w-full max-w-65 sm:w-64" />
      </div>

      <div className="flex items-center justify-center">
        <SkeletonBlock className="mb-1 h-4 w-20" />
      </div>

      <div className="mx-auto mb-3 flex max-w-75 flex-wrap items-center justify-center gap-1.5 sm:mb-4 sm:max-w-175 sm:gap-2">
        <SkeletonBlock className="h-6 w-24 sm:h-8 sm:w-30" />
        <SkeletonBlock className="h-6 w-24 sm:h-8 sm:w-34" />
        <SkeletonBlock className="h-6 w-27 sm:h-8 sm:w-38" />
        <SkeletonBlock className="h-6 w-28 sm:h-8 sm:w-44" />
        <SkeletonBlock className="h-6 w-29 sm:h-8 sm:w-42" />
        <SkeletonBlock className="h-6 w-22 sm:h-8 sm:w-28" />
      </div>
    </>
  );
}
