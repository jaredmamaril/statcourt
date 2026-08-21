import type { Metadata } from "next";

export const siteUrl = "https://statcourt.app";
export const siteName = "StatCourt";

export const defaultSeoTitle =
  "StatCourt | NBA Player Analytics, Rankings & Lineup Builder";

export const defaultSeoDescription =
  "Explore NBA player statistics, compare players, build custom lineups, analyze team fit, view rankings, and discover basketball insights with StatCourt.";

export const defaultOgImage = "/readme/statcourt-preview.png";

type StatCourtMetadataOptions = {
  title: string;
  description: string;
  path: string;
};

export function createStatCourtMetadata({
  title,
  description,
  path,
}: StatCourtMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: path,
      siteName,
      images: [
        {
          url: defaultOgImage,
          width: 2048,
          height: 1024,
          alt: "StatCourt NBA player comparison preview",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: [defaultOgImage],
    },
  };
}
