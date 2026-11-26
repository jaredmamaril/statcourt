import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

function getSupabaseImageHostname() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) return null;

  try {
    const parsedUrl = new URL(supabaseUrl);

    return parsedUrl.protocol === "https:" ? parsedUrl.hostname : null;
  } catch {
    return null;
  }
}

const supabaseImageHostname = getSupabaseImageHostname();

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://cdn.nba.com https://lh3.googleusercontent.com https://*.supabase.co",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // PostHog reverse proxy (US Cloud): events go to statcourt.app/ingest, so ad blockers
  // don't drop them, and the CSP's connect-src 'self' already allows them.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // PostHog's API paths end in a trailing slash; don't redirect them.
  skipTrailingSlashRedirect: true,
  // That also turns off Next's /path/ -> /path redirect everywhere, so restore it for
  // every route except /ingest (otherwise /players/x/ and /players/x are duplicates).
  async redirects() {
    return [
      {
        source: "/:path((?!ingest(?:/|$)).+)/",
        destination: "/:path",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.nba.com",
        pathname: "/headshots/nba/latest/1040x760/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      ...(supabaseImageHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseImageHostname,
              pathname: "/storage/v1/object/public/avatars/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
