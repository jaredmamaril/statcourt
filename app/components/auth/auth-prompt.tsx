import Link from "next/link";

type AuthPromptProps = {
  title: string;
  description: string;
  actionLabel?: string;
  href?: string;
  onClose?: () => void;
};

export function AuthPrompt({
  title,
  description,
  actionLabel = "Sign In",
  href = "/signin",
  onClose,
}: AuthPromptProps) {
  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/75 px-3">
      <div
        className="w-full max-w-[300px] rounded-lg border bg-[var(--court-panel)] p-3.5 lg:max-w-[360px] lg:p-5"
        style={{
          borderColor: "rgb(var(--court-accent-rgb) / 0.4)",
          boxShadow:
            "0 0 24px rgb(var(--court-accent-rgb) / 0.22), 0 0 30px rgb(var(--court-accent-rgb) / 0.12)",
        }}
      >
        <p className="font-michroma text-[10px] leading-snug text-white lg:text-sm">
          {title}
        </p>

        <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/45 lg:text-[9px]">
          {description}
        </p>

        <div className="mt-3 flex gap-2 lg:mt-4">
          <Link
            href={href}
            className="rounded-md border px-3 py-2 font-michroma text-[7px] uppercase text-[var(--court-accent)] transition hover:text-white lg:text-[9px]"
            style={{
              borderColor: "rgb(var(--court-accent-rgb) / 0.5)",
              backgroundColor: "rgb(var(--court-accent-rgb) / 0.1)",
            }}
          >
            {actionLabel}
          </Link>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/10 px-3 py-2 font-michroma text-[7px] uppercase text-white/50 transition hover:border-white/25 hover:text-white lg:text-[9px]"
            >
              Not Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
