import Image from "next/image";

const navItems = [
  { label: "Home", href: "/" },
  { label: "All Players", href: "/all-players" },
  { label: "Rankings", href: "/rankings" },
  { label: "Lineups", href: "/lineups" },
  { label: "About", href: "/about" },
  //{ label: "Sign In", href: "/sign-in" }, // Future: button instead of nav item
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/court-background.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="absolute inset-0 bg-black/65" />

      <header className="relative z-10 border-bbg-transparent">
        <div className="grid h-16 w-full grid-cols-3 items-center justify-between px-3 sm:px-3">
          <a
            href="#"
            className="flex items-center gap-3"
            aria-label="StatCourt home"
          >
            <Image
              src="/statcourt-logo.png"
              alt="StatCourt logo"
              width={44}
              height={44}
              priority
              className="h-11 w-11 rounded-md"
            />
            <span className="text-xl font-semibold font-michroma text-white sm:text-2xl tracking-wide antialiased">
              STATCOURT
            </span>
          </a>

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

          <div className="justify-self-end">
            <button className="flex items-center rounded-md bg-[#347A99] px-4 py-2 text-base font-michroma text-white">
              SIGN IN
            </button>
          </div>
        </div>
      </header>
    </main>
  );
}
