import { LoadingSpinner } from "./loading-spinner";

type DatabaseLoadingStateProps = {
  title?: string;
  description?: string;
};

export function DatabaseLoadingState({
  title = "Loading Players",
  description = "Syncing profiles...",
}: DatabaseLoadingStateProps) {
  return (
    <div className="mx-auto mt-5 w-fit max-w-60 rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[color:color-mix(in_srgb,var(--court-panel)_80%,transparent)] px-3 py-2.5 text-center shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.12)] lg:mt-8 lg:max-w-sm lg:px-8 lg:py-5">
      <p className="font-michroma text-[7px] uppercase text-[var(--court-accent)] lg:text-xs">
        {title}
      </p>

      <p className="mt-1 font-michroma text-[5.5px] text-white/35 lg:mt-2 lg:text-[9px]">
        {description}
      </p>

      <LoadingSpinner className="mt-2 h-4 w-4 lg:mt-4 lg:h-6 lg:w-6" />
    </div>
  );
}
