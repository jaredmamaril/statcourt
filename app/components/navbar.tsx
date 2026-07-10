"use client";

import { mockUser as user } from "../lib/mock-auth";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  Bookmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Trophy,
  User,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

{
  /* Future: consider adding a mobile menu for smaller screens, and implementing user authentication to conditionally show different nav items or a user profile dropdown when signed in */
}
type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
};
{
  /* Nav items | Future: generated from API or database in the future for easier maintenance and scalability */
}
const navItems: NavItem[] = [
  { label: "court", href: "/court", icon: Activity, color: "#A855F7" },
  { label: "players", href: "/players", icon: Users, color: "#1bc2ec" },
  { label: "rankings", href: "/rankings", icon: Trophy, color: "#EFBF04" },
  {
    label: "lineups",
    href: "/lineups",
    icon: LayoutDashboard,
    color: "#22C55E",
  },
];

export default function Navbar() {
  // Path to desired page
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
        <div className="grid h-12 w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-2 lg:px-3">
          {/* Logo and site name on the left */}
          <Link
            href="/"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsUserMenuOpen(false);
            }}
            className="flex w-fit items-center gap-3"
          >
            <Image
              src="/statcourt-logo.svg"
              alt="StatCourt Logo"
              width={32}
              height={32}
              priority
              className="h-10 w-10 rounded-md lg:h-12 lg:w-12"
            />
            <span className="hidden font-michroma text-xl font-bold text-[#1bc2ec] min-[360px]:block lg:text-2xl">
              statcourt
            </span>
          </Link>
          <nav className="hidden items-center justify-center gap-6 lg:flex">
            {/* Navigation links */}
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  scroll={true}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsUserMenuOpen(false);
                  }}
                  className={`font-michroma text-base transition-colors duration-200 ${isActive ? "text-[#1bc2ec] text-lg font-bold" : "text-white/90 hover:text-[#1bc2ec]"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center justify-end justify-self-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen((current) => !current);
                setIsUserMenuOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#1bc2ec]/45 bg-[#1bc2ec]/10 text-[#1bc2ec] shadow-[0_0_14px_rgba(27,194,236,0.18)] transition hover:border-[#1bc2ec]/80 hover:bg-[#1bc2ec]/18 hover:text-white lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>

            {user ? (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen((current) => !current);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-[#1bc2ec]/60 bg-[#1bc2ec]/10 font-michroma text-[12px] text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.24)] transition hover:border-[#1bc2ec] hover:bg-[#1bc2ec]/20 hover:text-white hover:shadow-[0_0_24px_rgba(27,194,236,0.42)] lg:h-10 lg:w-44 lg:justify-start lg:gap-2 lg:px-3"
                    aria-expanded={isUserMenuOpen}
                    aria-label="Open account menu"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#06131d] text-[10px] uppercase text-[#1bc2ec]">
                      T
                    </span>

                    <span className="hidden min-w-0 flex-1 truncate text-left lg:block">
                      Tyler
                    </span>
                  </button>

                  <div
                    className={`absolute right-0 top-10 z-999 w-36 rounded-md border border-white/10 bg-[#06131d]/95 p-1.5 shadow-[0_0_20px_rgba(0,0,0,0.4)] transition lg:top-11 lg:w-44 lg:p-2 ${
                      isUserMenuOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-1 opacity-0"
                    }`}
                  >
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-1.5 rounded px-2 py-1.5 text-left font-michroma text-[7px] uppercase text-white/90 transition hover:bg-white/5 hover:text-[#1bc2ec] lg:gap-2 lg:px-3 lg:py-2 lg:text-[10px]"
                    >
                      <UserCircle className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                      My Profile
                    </Link>

                    <Link
                      href="/lineups?tab=saved"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-1.5 rounded px-2 py-1.5 text-left font-michroma text-[7px] uppercase text-white/90 transition hover:bg-white/5 hover:text-[#1bc2ec] lg:gap-2 lg:px-3 lg:py-2 lg:text-[10px]"
                    >
                      <Bookmark className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                      Saved Lineups
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-1.5 rounded px-2 py-1.5 text-left font-michroma text-[7px] uppercase text-white/90 transition hover:bg-white/5 hover:text-[#1bc2ec] lg:gap-2 lg:px-3 lg:py-2 lg:text-[10px]"
                    >
                      <Settings className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                      Settings
                    </Link>

                    <button
                      type="button"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="mt-1 flex w-full cursor-pointer items-center gap-1.5 rounded border-t border-white/10 px-2 py-1.5 text-left font-michroma text-[7px] uppercase text-red-600/80 transition hover:bg-white/5 hover:text-red-600 lg:gap-2 lg:px-3 lg:py-2 lg:text-[10px]"
                    >
                      <LogOut className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link
                href="/signin"
                className="
                group inline-flex cursor-pointer items-center gap-1.5 rounded-md
                border border-[#1bc2ec]/60 bg-[#06131d]/80
                px-2.5 py-2 font-michroma text-[7px] uppercase tracking-wide
                text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.22)]
                transition duration-200
                hover:border-[#1bc2ec]/80 hover:bg-[#1bc2ec]/10
                hover:text-white hover:shadow-[0_0_20px_rgba(27,194,236,0.35)]
                active:scale-[0.97]
                lg:gap-2 lg:px-3.5 lg:text-[9px]
              "
              >
                <User className="h-3 w-3 transition group-hover:brightness-125 lg:h-3.5 lg:w-3.5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed left-0 right-0 top-12 z-999998 border-b border-[#1bc2ec]/20 bg-[#06131d]/95 px-3 py-2 shadow-[0_0_24px_rgba(0,0,0,0.45)] lg:hidden">
          <div className="grid gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-md border bg-black/20 px-2.5 py-2 font-michroma text-[8px] uppercase tracking-wide transition hover:bg-white/5"
                  style={{
                    borderColor: isActive ? item.color : `${item.color}55`,
                    color: item.color,
                    boxShadow: isActive ? `0 0 14px ${item.color}33` : "none",
                  }}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span className="min-w-0 truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="h-12" aria-hidden="true" />
    </>
  );
}
