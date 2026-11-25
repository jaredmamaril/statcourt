import { NextResponse } from "next/server";
import { getPlayerForSlug } from "../../../components/player-profile-source";
import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
} from "../../../lib/rate-limit";
import { defaultOgImage } from "../../../lib/seo";
import {
  DEFAULT_SHARE_MODE,
  getShareImagePath,
  parseStatMode,
} from "../../../lib/share";
import { getDuplicatePlayerSlugs, getPlayerHref } from "../../../lib/player-slug";
import { renderPlayerShareImage } from "../player-share-image";

// The share card for one player in one stat mode: the OG/Twitter preview image and the
// Share menu's "Download image". To keep the image cache bounded, only one URL per
// player and mode is rendered, /players/{canonical-slug}/share-image?mode={mode}.
// Anything else (other params, different casing, invalid or repeated modes, encoded
// names) redirects there, so junk query strings can't bypass the CDN cache.

const IMAGE_CACHE_CONTROL =
  "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";

type ShareImageRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: ShareImageRouteContext) {
  const rateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "share-image", {
      perMinute: 60,
      perDay: 2_000,
    }),
  );

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

  const { slug } = await params;
  const url = new URL(request.url);
  const mode =
    parseStatMode(url.searchParams.get("mode")?.toLowerCase()) ?? DEFAULT_SHARE_MODE;
  const { player, slugIndex } = await getPlayerForSlug(slug);

  // Unknown players get the static site preview, so random slugs can't create
  // new cached renders either.
  if (!player) {
    return NextResponse.redirect(new URL(defaultOgImage, url), 308);
  }

  const canonicalPath = getPlayerHref(player, getDuplicatePlayerSlugs(slugIndex));
  const normalizedPath = getShareImagePath(canonicalPath, mode);

  if (`${url.pathname}${url.search}` !== normalizedPath) {
    return NextResponse.redirect(new URL(normalizedPath, url), 308);
  }

  return renderPlayerShareImage(slug, mode, {
    "Cache-Control": IMAGE_CACHE_CONTROL,
  });
}
