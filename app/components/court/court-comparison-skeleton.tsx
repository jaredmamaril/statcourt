import { SkeletonBlock } from "../loading/skeleton";

export function CourtComparisonHeaderSkeleton() {
  return (
    <div className="mx-auto w-full max-w-70 rounded-lg border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[color:color-mix(in_srgb,var(--court-panel)_82%,transparent)] px-3 py-2 text-center shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.1)] sm:w-fit sm:max-w-none sm:px-4 sm:py-2.5">
      <SkeletonBlock className="mx-auto h-2.5 w-32 sm:h-3 sm:w-40" />
      <SkeletonBlock className="mx-auto mt-2 h-4 w-48 sm:h-5 sm:w-80" />

      <div className="mt-1.5 inline-flex rounded-md border border-white/10 bg-black/25 p-0.5">
        {[0, 1, 2].map((item) => (
          <SkeletonBlock
            key={item}
            className="mx-0.5 h-5 w-14 rounded sm:h-6 sm:w-18"
          />
        ))}
      </div>
    </div>
  );
}

function CourtPlayerPanelSkeleton() {
  return (
    <div className="relative z-10 flex justify-center">
      <div className="flex flex-col items-center">
        <SkeletonBlock className="h-3 w-28 sm:h-4 sm:w-44 lg:w-50" />

        <div className="mt-1 flex h-26 w-26 items-center justify-center rounded-md border-2 border-[rgb(var(--court-accent-rgb)/0.35)] bg-black/25 sm:h-48 sm:w-48 lg:h-64 lg:w-64">
          <SkeletonBlock className="h-14 w-14 rounded-full sm:h-28 sm:w-28 lg:h-36 lg:w-36" />
        </div>

        <SkeletonBlock className="mt-2 h-10 w-30 sm:h-12 sm:w-64" />
      </div>
    </div>
  );
}

function RadarSkeleton() {
  const radarRings = [44, 61, 78, 95, 112];
  const radarSpokes = [0, 60, 120, 180, 240, 300];

  return (
    <div className="relative z-10 mx-auto h-62 w-full max-w-62 sm:h-78 sm:max-w-78 lg:h-108 lg:max-w-125">
      <div className="statcourt-skeleton flex h-full w-full items-center justify-center rounded-full bg-black/40">
        <svg
          viewBox="0 0 260 260"
          aria-hidden="true"
          className="h-[92%] w-[92%] opacity-65"
        >
          {radarRings.map((radius) => {
            const points = radarSpokes
              .map((angle) => {
                const radians = ((angle - 90) * Math.PI) / 180;

                return `${130 + Math.cos(radians) * radius},${
                  130 + Math.sin(radians) * radius
                }`;
              })
              .join(" ");

            return (
              <polygon
                key={radius}
                points={points}
                fill="none"
                stroke="rgb(var(--court-accent-rgb) / 0.34)"
                strokeWidth="1.4"
              />
            );
          })}

          {radarSpokes.map((angle) => {
            const radians = ((angle - 90) * Math.PI) / 180;
            const endX = 130 + Math.cos(radians) * 112;
            const endY = 130 + Math.sin(radians) * 112;

            return (
              <line
                key={angle}
                x1="130"
                y1="130"
                x2={endX}
                y2={endY}
                stroke="rgb(var(--court-accent-rgb) / 0.28)"
                strokeWidth="1.2"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function CourtComparisonSkeleton() {
  return (
    <div className="mx-auto mt-2 grid w-full max-w-7xl grid-cols-2 items-start gap-x-3 gap-y-5 lg:mt-1 lg:grid-cols-[320px_minmax(420px,1fr)_320px] lg:items-center lg:gap-8">
      <div className="order-1 lg:order-1">
        <CourtPlayerPanelSkeleton />
      </div>

      <div className="order-3 col-span-2 lg:order-2 lg:col-span-1">
        <RadarSkeleton />
      </div>

      <div className="order-2 lg:order-3">
        <CourtPlayerPanelSkeleton />
      </div>

      <div className="order-4 col-span-2 mx-auto mt-4 grid w-full max-w-6xl grid-cols-2 gap-2 px-3 sm:grid-cols-2 sm:gap-3 sm:px-0 lg:col-span-3 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className={`rounded-lg border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_94%,black)] px-2.5 py-2 sm:px-4 sm:py-3 ${
              item === 4 ? "col-span-2 lg:col-span-1" : ""
            }`}
          >
            <SkeletonBlock className="mx-auto h-2 w-18 sm:h-2.5 sm:w-24" />
            <SkeletonBlock className="mx-auto mt-2 h-3 w-22 sm:mt-3 sm:w-28" />
          </div>
        ))}
      </div>

      <div className="order-5 col-span-2 lg:col-span-3">
        <div className="rounded-lg border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_82%,transparent)] p-3 sm:p-4">
          <SkeletonBlock className="h-2.5 w-36" />
          <SkeletonBlock className="mt-3 h-3 w-full" />
          <SkeletonBlock className="mt-2 h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}
