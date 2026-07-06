"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Bookmark, LogOut, Settings, User, UserCircle } from "lucide-react";

{
  /* Future: consider adding a mobile menu for smaller screens, and implementing user authentication to conditionally show different nav items or a user profile dropdown when signed in */
}
type NavItem = {
  label: string;
  href: string;
};
{
  /* Nav items | Future: generated from API or database in the future for easier maintenance and scalability */
}
const navItems: NavItem[] = [
  { label: "court", href: "/court" },
  { label: "players", href: "/players" },
  { label: "rankings", href: "/rankings" },
  { label: "lineups", href: "/lineups" },
];

export default function Navbar() {
  // Path to desired page
  const pathname = usePathname();

  // Scrolling to the top when new page is clicked
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [pathname]);

  if (pathname === "/") {
    return null; // Don't render the navbar on the homepage
  }

  // Auth
  const user = {
    name: "Tyler",
    initials: "T",
  };
  // temporary future shape:
  // const user = {
  //   name: "Tyler",
  //   initials: "T",
  // };

  return (
    <>
      <header
        className="border-b border-white/10 bg-background"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999999, // On top of everything
        }}
      >
        <div className="grid h-12 w-full grid-cols-3 items-center px-3">
          {/* Logo and site name on the left */}
          <Link href="/" className="flex w-fit items-center gap-3">
            <Image
              src="/statcourt-logo.svg"
              alt="StatCourt Logo"
              width={32}
              height={32}
              priority
              className="rounded-md h-12 w-12"
            />
            <span className="font-michroma text-2xl font-bold text-[#1bc2ec]">
              statcourt
            </span>
          </Link>
          <nav className="hidden items-center justify-center gap-6 md:flex">
            {/* Navigation links */}
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  scroll={true}
                  className={`font-michroma text-base transition-colors duration-200 ${isActive ? "text-[#1bc2ec] text-lg font-bold" : "text-white/90 hover:text-[#1bc2ec]"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center justify-end justify-self-end">
            {user ? (
              <>
                <div className="group relative">
                  <button
                    type="button"
                    className="flex h-10 w-44 items-center gap-2 rounded-md border border-[#1bc2ec]/60 bg-[#1bc2ec]/10 px-3 font-michroma text-[12px] text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.24)] transition hover:border-[#1bc2ec] hover:bg-[#1bc2ec]/20 hover:text-white hover:shadow-[0_0_24px_rgba(27,194,236,0.42)]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#06131d] text-[10px] uppercase text-[#1bc2ec]">
                      T
                    </span>

                    <span className="min-w-0 flex-1 truncate text-left">
                      Tyler
                    </span>
                  </button>

                  <div className="pointer-events-none absolute right-0 z-999 w-44 rounded-md border border-white/10 bg-[#06131d]/95 p-2 opacity-0 shadow-[0_0_24px_rgba(0,0,0,0.45)] transition group-hover:pointer-events-auto group-hover:opacity-100">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded px-3 py-2 text-left font-michroma text-[10px] uppercase text-white/90 transition hover:bg-white/5 hover:text-[#1bc2ec]"
                    >
                      <UserCircle className="h-3.5 w-3.5" />
                      My Profile
                    </Link>

                    <Link
                      href="/lineups"
                      className="flex items-center gap-2 rounded px-3 py-2 text-left font-michroma text-[10px] uppercase text-white/90 transition hover:bg-white/5 hover:text-[#1bc2ec]"
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      Saved Lineups
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-2 rounded px-3 py-2 text-left font-michroma text-[10px] uppercase text-white/90 transition hover:bg-white/5 hover:text-[#1bc2ec]"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Settings
                    </Link>

                    <button
                      type="button"
                      className="mt-1 flex w-full items-center gap-2 rounded border-t border-white/10 px-3 py-2 text-left font-michroma text-[10px] uppercase text-red-600/80 transition hover:bg-white/5 hover:text-red-600"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link
                href="/signin"
                className="
                group inline-flex cursor-pointer items-center gap-2 rounded-md
                border border-[#1bc2ec]/60 bg-[#06131d]/80
                px-3.5 py-2 font-michroma text-[9px] uppercase tracking-wide
                text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.22)]
                transition duration-200
                hover:border-[#1bc2ec]/80 hover:bg-[#1bc2ec]/10
                hover:text-white hover:shadow-[0_0_20px_rgba(27,194,236,0.35)]
                active:scale-[0.97]
              "
              >
                <User className="h-3.5 w-3.5 transition group-hover:brightness-125" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="h-12" aria-hidden="true" />
    </>
  );
}
