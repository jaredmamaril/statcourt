"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

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
  { label: "COURT", href: "/court" },
  { label: "PLAYERS", href: "/players" },
  { label: "RANKINGS", href: "/rankings" },
  { label: "LINEUPS", href: "/lineups" },
];

export default function Navbar() {
  const pathname = usePathname();
  if (pathname === "/") {
    return null; // Don't render the navbar on the homepage
  }

  return (
    <header className="relative z-50 border-b border-transparent bg-background backdrop-blur-sm">
      <div className="grid h-12 w-full grid-cols-3 items-center px-3">
        {/* Logo and site name on the left */}
        <Link href="/" className="flex w-fit items-center gap-3">
          <Image
            src="/statcourt-logo.png"
            alt="StatCourt Logo"
            width={32}
            height={32}
            priority
            className="rounded-md h-11 w-11"
          />
          <span className="font-michroma text-2xl text-white">STATCOURT</span>
        </Link>
        <nav className="hidden items-center justify-center gap-6 md:flex">
          {/* Navigation links */}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-michroma text-base transition-colors duration-200 ${isActive ? "text-[#347A99] text-lg font-bold" : "text-white/90 hover:text-[#347A99]"}`}
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
  );
}
