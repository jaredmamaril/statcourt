type LoadingSpinnerProps = {
  className?: string;
};

export function LoadingSpinner({ className = "" }: LoadingSpinnerProps) {
  return (
    <div
      aria-hidden="true"
      className={`mx-auto rounded-full border border-[#1bc2ec]/20 border-t-[#1bc2ec] animate-spin ${className}`}
    />
  );
}
