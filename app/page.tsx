"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
      className={`min-h-screen bg-background text-foreground transition-all duration-700 ease-out ${
        isLeaving ? "scale-105 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      {/*Background video with overlay */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-center"
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
      <section className="relative z-10 flex min-h-screen -translate-y-10 items-center justify-center text-center">
        {/* Enter the Court button */}
        <button
          onClick={() => {
            setIsLeaving(true);

            setTimeout(() => {
              router.push("/court");
            }, 650);
          }}
          className={`mt-8 cursor-pointer rounded-md border border-[#1bc2ec]/50 bg-[#347A99]/20 px-6 py-3 text-base font-michroma text-white shadow-[0_0_18px_rgba(27,194,236,0.18)] transition-all duration-500 hover:-translate-y-1 hover:border-[#1bc2ec] hover:bg-[#1bc2ec]/20 hover:shadow-[0_0_28px_rgba(27,194,236,0.35)] active:scale-95 ${
            showEnterButton
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0"
          }`}
        >
          ENTER THE COURT
        </button>
      </section>
    </main>
  );
}
