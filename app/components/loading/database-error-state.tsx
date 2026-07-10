type DatabaseErrorStateProps = {
  title?: string;
  description?: string;
};

export function DatabaseErrorState({
  title = "Players Unavailable",
  description = "Showing fallback data.",
}: DatabaseErrorStateProps) {
  return (
    <div className="mx-auto mt-5 w-fit max-w-60 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-center lg:mt-8 lg:max-w-sm lg:px-8 lg:py-5">
      <p className="font-michroma text-[7px] uppercase text-red-300 lg:text-xs">
        {title}
      </p>

      <p className="mt-1 font-michroma text-[5.5px] text-white/35 lg:mt-2 lg:text-[9px]">
        {description}
      </p>
    </div>
  );
}
