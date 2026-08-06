import { SkeletonBlock } from "../../loading/skeleton";

function FeaturedCategoryCardSkeleton() {
  return (
    <div className="grid min-h-26 grid-cols-1 rounded-md border border-[rgb(var(--court-accent-rgb)/0.2)] bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-2 lg:min-h-36 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-6 lg:p-4">
      <div>
        <div className="flex items-center gap-1.5">
          <SkeletonBlock className="h-3 w-3 rounded-full lg:h-4 lg:w-4" />
          <SkeletonBlock className="h-3 w-24 lg:h-5 lg:w-34" />
        </div>

        <SkeletonBlock className="mt-3 h-2 w-14 lg:mt-5 lg:w-20" />
        <SkeletonBlock className="mt-2 h-2.5 w-28 lg:h-3 lg:w-38" />
        <SkeletonBlock className="mt-3 h-2 w-12 lg:mt-5 lg:w-18" />
        <SkeletonBlock className="mt-2 h-2.5 w-16 lg:h-3 lg:w-24" />
      </div>

      <SkeletonBlock className="mt-2 h-5 w-full rounded-md lg:mt-0 lg:h-12 lg:w-24" />
    </div>
  );
}

export function FeaturedLineupsLoadingSkeleton() {
  return (
    <>
      <div className="mt-1 grid grid-cols-2 gap-3 px-1 lg:mt-5 lg:grid-cols-3 lg:gap-4 lg:px-0">
        {Array.from({ length: 6 }, (_, index) => (
          <FeaturedCategoryCardSkeleton key={index} />
        ))}
      </div>

      <FeaturedLineupDetailSkeleton />
    </>
  );
}

const featuredCourtSkeletonMarkers = [
  { position: "PG", left: "50%", top: "6%" },
  { position: "SG", left: "22%", top: "22%" },
  { position: "SF", left: "78%", top: "74%" },
  { position: "PF", left: "25%", top: "68%" },
  { position: "C", left: "65%", top: "42%" },
];

type FeaturedLineupDetailSkeletonProps = {
  selectedCategoryColor?: string;
};

export function FeaturedLineupDetailSkeleton({
  selectedCategoryColor = "var(--court-accent)",
}: FeaturedLineupDetailSkeletonProps) {
  return (
    <div className="mt-4 min-h-136 scroll-mt-24 rounded-md border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-2 lg:mt-8 lg:min-h-168 lg:p-4">
      <SkeletonBlock className="mx-auto h-4 w-42 lg:h-5 lg:w-72" />

      <div className="mt-3 grid gap-2 lg:mt-5 lg:grid-cols-[220px_1fr] lg:gap-6">
        <div className="grid gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock
              key={index}
              className="h-11 rounded-md lg:h-14"
            />
          ))}
        </div>

        <div className="rounded-md border border-[rgb(var(--court-accent-rgb)/0.18)] bg-[color:color-mix(in_srgb,var(--court-panel-alt)_88%,black)] p-2 lg:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr] lg:gap-6">
            <div>
              <SkeletonBlock className="h-5 w-48 lg:h-7 lg:w-64" />
              <SkeletonBlock className="mt-3 h-3 w-32" />
              <SkeletonBlock className="mt-5 h-3 w-full" />
              <SkeletonBlock className="mt-2 h-3 w-4/5" />

              <div className="mt-5 grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <SkeletonBlock
                    key={index}
                    className="h-8 rounded-md lg:h-10"
                  />
                ))}
              </div>
            </div>

            <div className="relative min-h-76 lg:min-h-120">
              <div className="statcourt-skeleton relative mx-auto h-[19rem] w-full max-w-[22rem] overflow-visible rounded-md lg:h-[30rem] lg:max-w-none">
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 8 92 L 8 70 A 42 42 0 0 1 92 70 L 92 92"
                    fill="none"
                    stroke={selectedCategoryColor}
                    strokeOpacity="0.55"
                    strokeWidth="0.8"
                    vectorEffect="non-scaling-stroke"
                  />
                  <rect
                    x="40"
                    y="63"
                    width="20"
                    height="29"
                    fill="none"
                    stroke={selectedCategoryColor}
                    strokeOpacity="0.55"
                    strokeWidth="0.8"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d="M 40 63 A 10 10 0 0 1 60 63"
                    fill="none"
                    stroke={selectedCategoryColor}
                    strokeOpacity="0.55"
                    strokeWidth="0.8"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx="50"
                    cy="86"
                    r="1.4"
                    fill="none"
                    stroke={selectedCategoryColor}
                    strokeOpacity="0.85"
                    strokeWidth="0.8"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1="43"
                    x2="57"
                    y1="86"
                    y2="86"
                    stroke={selectedCategoryColor}
                    strokeOpacity="0.85"
                    strokeWidth="0.8"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {featuredCourtSkeletonMarkers.map((marker) => (
                  <div
                    key={marker.position}
                    className="absolute z-10 -translate-x-1/2 text-center"
                    style={{
                      left: marker.left,
                      top: marker.top,
                    }}
                  >
                    <SkeletonBlock className="mx-auto h-12 w-12 rounded-full lg:h-20 lg:w-20" />
                    <SkeletonBlock className="mx-auto mt-1 h-2 w-14 lg:h-2.5 lg:w-20" />
                    <SkeletonBlock className="mx-auto mt-1 h-1.5 w-5 lg:h-2 lg:w-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuilderPlayerCardSkeleton() {
  return (
    <div className="rounded-md border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-2 lg:p-3">
      <SkeletonBlock className="mx-auto h-13 w-13 rounded-md lg:h-20 lg:w-20" />
      <SkeletonBlock className="mx-auto mt-3 h-3 w-24 max-w-full" />
      <SkeletonBlock className="mx-auto mt-2 h-2 w-16" />
      <SkeletonBlock className="mx-auto mt-3 h-3 w-18" />
    </div>
  );
}

export function BuilderWorkspaceSkeleton() {
  const courtMarkerSkeletons = [
    { position: "PG", className: "left-1/2 top-3 lg:top-6" },
    { position: "SG", className: "left-[24%] top-13 lg:left-[22%] lg:top-16" },
    {
      position: "SF",
      className: "left-[76%] bottom-8 lg:left-[78%] lg:bottom-10",
    },
    {
      position: "PF",
      className: "left-[28%] bottom-14 lg:left-[25%] lg:bottom-20",
    },
    { position: "C", className: "left-[64%] top-35 lg:left-[65%] lg:top-50" },
  ];

  return (
    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_122px] items-start gap-1 lg:grid-cols-[400px_300px_1fr] lg:gap-5">
      <div className="min-w-0">
        <div className="mb-3 flex flex-col items-center justify-center gap-1 lg:mb-2 lg:flex-row lg:gap-2">
          <SkeletonBlock className="h-6 w-34 rounded-md lg:h-8 lg:w-52" />
          <SkeletonBlock className="h-6 w-20 rounded-md lg:h-8 lg:w-28" />
        </div>

        <div className="grid grid-cols-5 gap-1.5 lg:gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock
              key={index}
              className="h-9 rounded-md lg:h-13"
            />
          ))}
        </div>

        <SkeletonBlock className="mt-3 h-9 rounded-md lg:h-12" />
        <SkeletonBlock className="mx-auto mt-4 h-2.5 w-38" />

        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <BuilderPlayerCardSkeleton key={index} />
          ))}
        </div>
      </div>

      <div className="rounded-md border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-2 lg:p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <SkeletonBlock className="h-2.5 w-18" />
            <SkeletonBlock className="mt-2 h-4 w-28 lg:h-6 lg:w-42" />
          </div>
          <SkeletonBlock className="h-8 w-14 lg:h-10 lg:w-18" />
        </div>

        <div className="mt-4 grid gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock
              key={index}
              className="h-14 rounded-md lg:h-18"
            />
          ))}
        </div>
      </div>

      <div className="col-span-2 mt-4 min-h-80 lg:col-span-1 lg:mt-0 lg:min-h-150">
        <div className="statcourt-skeleton relative mx-auto h-76 w-full max-w-80 overflow-hidden rounded-md lg:h-120 lg:max-w-none lg:overflow-visible">
          <div className="absolute left-1/2 bottom-8 h-[62%] w-[82%] -translate-x-1/2 rounded-t-full border-t border-l border-r border-[rgb(var(--court-accent-rgb)/0.28)] lg:bottom-10 lg:h-[63%] lg:w-[88%]" />

          <div className="absolute left-1/2 bottom-8 h-28 w-20 -translate-x-1/2 border border-[rgb(var(--court-accent-rgb)/0.28)] lg:bottom-10 lg:h-40 lg:w-28" />

          <div className="absolute left-1/2 bottom-36 h-10 w-20 -translate-x-1/2 rounded-t-full border-t border-l border-r border-[rgb(var(--court-accent-rgb)/0.28)] lg:bottom-50 lg:h-14 lg:w-28" />

          <div className="absolute left-1/2 bottom-15 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-[rgb(var(--court-accent-rgb)/0.45)] lg:bottom-20 lg:h-3 lg:w-3" />

          <div className="absolute left-1/2 bottom-15 h-px w-12 -translate-x-1/2 bg-[rgb(var(--court-accent-rgb)/0.45)] lg:bottom-20 lg:w-16" />

          {courtMarkerSkeletons.map((marker) => (
            <div
              key={marker.position}
              className={`absolute -translate-x-1/2 text-center ${marker.className}`}
            >
              <SkeletonBlock className="mx-auto h-12 w-12 rounded-full lg:h-20 lg:w-20" />
              <SkeletonBlock className="mx-auto mt-1 h-2 w-14 lg:h-2.5 lg:w-20" />
              <SkeletonBlock className="mx-auto mt-1 h-1.5 w-5 lg:h-2 lg:w-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SavedLineupCardSkeleton() {
  return (
    <div className="rounded-md border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-2 lg:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="h-3 w-24 lg:h-4 lg:w-36" />
          <SkeletonBlock className="mt-2 h-2 w-14" />
        </div>
        <SkeletonBlock className="h-10 w-12 rounded-md lg:h-14 lg:w-18" />
      </div>

      <SkeletonBlock className="mt-3 h-3 w-32 max-w-full" />
      <SkeletonBlock className="mt-2 h-2.5 w-40 max-w-full" />

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} className="h-8 rounded-md lg:h-10" />
        ))}
      </div>
    </div>
  );
}

export function SavedLineupsLoadingSkeleton() {
  return (
    <section className="min-h-[calc(100svh-120px)] animate-[pageEnter_220ms_ease-out_both] lg:min-h-[calc(100vh-140px)]">
      <div className="mt-3 lg:mt-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <SkeletonBlock className="h-9 rounded-md lg:h-11 lg:w-80" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-8 w-24 rounded-md lg:h-10 lg:w-34" />
            <SkeletonBlock className="h-8 w-24 rounded-md lg:h-10 lg:w-34" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-4">
          {Array.from({ length: 6 }, (_, index) => (
            <SavedLineupCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
