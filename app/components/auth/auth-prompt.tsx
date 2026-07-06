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
    <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/75">
      <div className="w-[min(360px,90vw)] rounded-lg border border-[#1bc2ec]/40 bg-[#06131d] p-5 shadow-[0_0_30px_rgba(27,194,236,0.25)]">
        <p className="font-michroma text-sm text-white">{title}</p>

        <p className="mt-2 font-michroma text-[9px] leading-relaxed text-white/45">
          {description}
        </p>

        <div className="mt-4 flex gap-2">
          <Link
            href={href}
            className="rounded-md border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-3 py-2 font-michroma text-[9px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white"
          >
            {actionLabel}
          </Link>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/10 px-3 py-2 font-michroma text-[9px] uppercase text-white/50 transition hover:border-white/25 hover:text-white"
            >
              Not Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
