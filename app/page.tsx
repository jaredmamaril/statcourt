"use client";

import { use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

{
  /* Future: extract nav items to a separate component and map over them for cleaner code */
}
const navItems = [
  { label: "Home", href: "/" },
  { label: "All Players", href: "/all-players" },
  { label: "Rankings", href: "/rankings" },
  { label: "Lineups", href: "/lineups" },
  { label: "About", href: "/about" },
];

export default function Home() {
  {
    /* Future: consider using a more robust state management solution if the app grows in complexity, especially for handling user authentication and global state */
  }
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showEnterButton, setShowEnterButton] = useState(false);
  const showButtonAtSecond = 4; // Show button after 4 seconds

  {
    /* Future: add error handling for video loading issues, such as displaying a fallback image or message if the video fails to load or play */
  }
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  return (
    <main
      className={`min-h-screen bg-background text-foreground transition-opacity duration-700 ${isLeaving ? "opacity-0" : "opacity-100"}`}
    >
      {/*Background video with overlay */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/court-background.mp4"
        autoPlay
        loop
        muted
        playsInline
        onTimeUpdate={() => {
          const video = videoRef.current;
          if (video && video.currentTime >= showButtonAtSecond) {
            setShowEnterButton(true);
          }
        }}
      />
      {/* Semi-transparent overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/65" />
      {/* Header with logo and navigation */}
      <header className="relative z-10 border-bbg-transparent">
        {/* Navigation bar */}
        <div className="grid h-16 w-full grid-cols-3 items-center justify-between px-3 sm:px-3">
          <a
            href="#"
            className="flex items-center gap-3"
            aria-label="StatCourt home"
          >
            {/* Logo image with alt text and priority loading */}
            <Image
              src="/statcourt-logo.png"
              alt="StatCourt logo"
              width={44}
              height={44}
              priority
              className="h-11 w-11 rounded-md"
            />
            {/* Logo text with custom font and styling */}
            <span className="text-xl font-semibold font-michroma text-white sm:text-2xl tracking-wide antialiased">
              STATCOURT
            </span>
          </a>
          {/* Navigation links, hidden on small screens */}
          <div className="hidden md:flex items-center gap-6 justify-self-center">
            <span className="text-base font-michroma text-white/90">
              {" "}
              ALL PLAYERS
            </span>
            <span className="text-base font-michroma text-white/90">
              {" "}
              RANKINGS
            </span>
            <span className="text-base font-michroma text-white/90">
              {" "}
              LINEUPS
            </span>
            <span className="text-base font-michroma text-white/90">
              {" "}
              ABOUT
            </span>
          </div>
          {/* Sign In button, aligned to the right */}
          <div className="justify-self-end">
            <button className="flex items-center rounded-md bg-[#347A99] px-4 py-2 text-base font-michroma text-white">
              SIGN IN
            </button>
          </div>
        </div>
      </header>
      <section className="relative z-10 flex min-h-[calc(100vh-4rem)] -translate-y-10 items-center justify-center text-center">
        {/* Enter the Court button */}
        <button
          onClick={() => {
            setIsLeaving(true);

            setTimeout(() => {
              router.push("/court");
            }, 700); // Match the duration of the fade-out transition
          }}
          className={`mt-8 cursor-pointer rounded-md bg-[#347A99] px-6 py-3 text-base font-michroma text-white transition-all duration-700 ${showEnterButton ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
        >
          ENTER THE COURT
        </button>
      </section>
    </main>
  );
}
