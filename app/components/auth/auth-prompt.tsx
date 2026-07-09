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
      <div className="w-full max-w-[300px] rounded-lg border border-[#1bc2ec]/40 bg-[#06131d] p-3.5 shadow-[0_0_24px_rgba(27,194,236,0.22)] lg:max-w-[360px] lg:p-5 lg:shadow-[0_0_30px_rgba(27,194,236,0.25)]">
        <p className="font-michroma text-[10px] leading-snug text-white lg:text-sm">
          {title}
        </p>

        <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/45 lg:text-[9px]">
          {description}
        </p>

        <div className="mt-3 flex gap-2 lg:mt-4">
          <Link
            href={href}
            className="rounded-md border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-3 py-2 font-michroma text-[7px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white lg:text-[9px]"
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
