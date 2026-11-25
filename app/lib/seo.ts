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
  // Off for routes with their own opengraph-image / twitter-image files.
  includeDefaultImage?: boolean;
  // Preview image for og:image and twitter:image (replaces the default image).
  image?: { url: string; width: number; height: number; alt: string };
  // og:url when the shared link differs from the canonical path (e.g. ?mode=peak);
  // the canonical tag always stays `path`.
  shareUrl?: string;
};

export function createStatCourtMetadata({
  title,
  description,
  path,
  includeDefaultImage = true,
  image,
  shareUrl,
}: StatCourtMetadataOptions): Metadata {
  const ogImage =
    image ??
    (includeDefaultImage
      ? {
          url: defaultOgImage,
          width: 2048,
          height: 1024,
          alt: "StatCourt NBA player comparison preview",
        }
      : null);

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: shareUrl ?? path,
      siteName,
      ...(ogImage && { images: [ogImage] }),
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      ...(ogImage && { images: [ogImage.url] }),
    },
  };
}
