import type { Metadata } from "next";
import { PlayerNotFoundMessage, PlayerPageNav, PlayerPageShell } from "./player-page-nav";

// Shown, with a real 404 status, when /players/{slug} names no player (page.tsx calls
// notFound()). Next.js adds <meta name="robots" content="noindex"> to 404 responses
// itself, so it isn't repeated here.
export const metadata: Metadata = {
  title: "Player Not Found",
};

export default function PlayerNotFound() {
  return (
    <PlayerPageShell>
      <PlayerPageNav />
      <PlayerNotFoundMessage />
    </PlayerPageShell>
  );
}
