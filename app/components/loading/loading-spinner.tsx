type LoadingSpinnerProps = {
  className?: string;
};

export function LoadingSpinner({ className = "" }: LoadingSpinnerProps) {
  return (
    <div
      aria-hidden="true"
      className={`statcourt-loading-spinner mx-auto animate-spin rounded-full border border-[rgb(var(--court-accent-rgb)/0.2)] border-t-[var(--court-accent)] ${className}`}
    />
  );
}
