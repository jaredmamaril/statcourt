"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { User } from "lucide-react";

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
          <div className="justify-self-end">
            <button
              type="button"
              className="
                cursor-pointer group inline-flex items-center gap-2 rounded-md
                border border-[#1bc2ec]/35 bg-[#06131d]/80
                px-3.5 py-2 font-michroma text-[9px] uppercase tracking-wide
                text-[#1bc2ec] shadow-[0_0_14px_rgba(27,194,236,0.12)]
                transition duration-200
                hover:border-[#1bc2ec]/80 hover:bg-[#1bc2ec]/10
                hover:text-white hover:shadow-[0_0_20px_rgba(27,194,236,0.35)]
                active:scale-[0.97]
                "
            >
              <User className="h-3.5 w-3.5 transition group-hover:brightness-125" />
              Sign In
            </button>
          </div>
        </div>
      </header>

      <div className="h-12" aria-hidden="true" />
    </>
  );
}
