"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerLinks = [
  {
    label: "Privacy",
    href: "/privacy",
  },
  {
    label: "Terms",
    href: "/terms",
  },
  {
    label: "Contact",
    href: "/contact",
  },
  {
    label: "Data Sources",
    href: "/data-sources",
  },
  {
    label: "Photo Credits",
    href: "/photo-credits",
  },
];

const footerHiddenRoutes = [
  "/signin",
  "/reset-password",
  "/settings",
  "/profile",
  "/auth/callback",
];

function shouldHideFooter(pathname: string) {
  return footerHiddenRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function GlobalFooter() {
  const pathname = usePathname();

  if (shouldHideFooter(pathname)) return null;

  return (
    <footer className="relative z-20 border-t border-[rgb(var(--court-accent-rgb)/0.16)] bg-[color:color-mix(in_srgb,var(--court-panel)_94%,black)] px-4 py-5 text-white/42 shadow-[0_-1px_18px_rgba(27,194,236,0.04)] lg:px-10 lg:py-7">
      <div className="mx-auto grid w-full max-w-7xl gap-3 font-michroma text-[7px] leading-relaxed lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:text-[10px]">
        <p className="text-white/45">StatCourt (c) 2026</p>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 lg:justify-center">
          {footerLinks.map((link, index) => (
            <span key={link.href} className="flex items-center gap-2">
              <Link
                href={link.href}
                className="transition hover:text-[var(--court-accent)]"
              >
                {link.label}
              </Link>

              {index < footerLinks.length - 1 ? (
                <span className="text-white/22">/</span>
              ) : null}
            </span>
          ))}
        </div>

        <p className="text-white/38 lg:text-right">
          Basketball analytics, built differently.
        </p>
      </div>
    </footer>
  );
}
