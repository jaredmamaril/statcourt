import Image from "next/image";

const navItems = ["All Players", "Rankings", "Lineups", "About", "Sign In"];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-[#092C4E] bg-[#07111f]/95 shadow-sm shadow-black/20">
        <div className="mx-auto flex h-16 w-full  items-center justify-between px-3 sm:px-3">
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
            <span className="text-xl font-semibold font-anton text-white sm:text-2xl tracking-wide antialiased">
              STATCOURT
            </span>
          </a>
        </div>
      </header>
    </main>
  );
}
