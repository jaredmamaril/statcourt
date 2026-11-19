import type { MetadataRoute } from "next";
import { getAppPlayers } from "./components/player-data-source";
import { getPlayerHref } from "./lib/player-slug";
import { siteUrl } from "./lib/seo";

export const revalidate = 3600;

const publicRoutes = [
  "",
  "/players",
  "/rankings",
  "/lineups",
  "/community",
  "/court",
  "/privacy",
  "/terms",
  "/contact",
  "/data-sources",
  "/photo-credits",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const players = await getAppPlayers();
  const playerRoutes = Array.from(
    new Set(players.map((player) => getPlayerHref(player.name))),
  );

  return [
    ...publicRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: now,
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.7,
    })),
    ...playerRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
