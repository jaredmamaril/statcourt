import type { MetadataRoute } from "next";
import { siteUrl } from "./lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        // PostHog's analytics proxy (next.config.ts rewrites); nothing to index.
        "/ingest/",
        "/admin/",
        "/auth/",
        "/profile",
        "/settings",
        "/signin",
        "/reset-password",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
