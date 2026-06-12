"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

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
  if (pathname === "/") {
    return null; // Don't render the navbar on the homepage
  }

  // Scrolling to the top when new page is clicked
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [pathname]);

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
            {/* Future: this button could open a sign-in modal or redirect to a sign-in page, and could be conditionally rendered based on user authentication state */}
            <button className="cursor-pointer rounded-md bg-[#347A99] px-4 py-2 text-base font-michroma text-white">
              SIGN IN
            </button>
          </div>
        </div>
      </header>

      <div className="h-12" aria-hidden="true" />
    </>
  );
}
