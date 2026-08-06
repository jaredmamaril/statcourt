import type { CSSProperties } from "react";

type SkeletonBlockProps = {
  className?: string;
  style?: CSSProperties;
};

export function SkeletonBlock({ className = "", style }: SkeletonBlockProps) {
  return (
    <div
      aria-hidden="true"
      className={`statcourt-skeleton rounded bg-[rgb(var(--court-accent-rgb)/0.12)] ${className}`}
      style={style}
    />
  );
}

type PlayerListSkeletonProps = {
  variant?: "cards" | "rows";
  count?: number;
};

export function PlayerListSkeleton({
  variant = "cards",
  count = 6,
}: PlayerListSkeletonProps) {
  const items = Array.from({ length: count }, (_, index) => index);

  if (variant === "rows") {
    return (
      <div className="mx-auto w-full max-w-100 space-y-1 pr-1">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-md border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-2"
          >
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-9 w-9 rounded-full" />
              <div className="min-w-0 flex-1">
                <SkeletonBlock className="h-2.5 w-32 max-w-full" />
                <SkeletonBlock className="mt-2 h-2 w-20" />
              </div>
              <SkeletonBlock className="h-4 w-10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-120 grid-cols-2 gap-2 pr-1 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item}
          className="flex min-h-33 flex-col items-center rounded-md border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] px-2 py-2"
        >
          <SkeletonBlock className="h-13 w-13 rounded-full" />
          <SkeletonBlock className="mt-3 h-2.5 w-20" />
          <SkeletonBlock className="mt-2 h-2 w-12" />
          <SkeletonBlock className="mt-2 h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
