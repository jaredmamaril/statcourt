"use client";

import { useEffect } from "react";
import { getPlayerSearchQuery, track, type AnalyticsEvents } from "./analytics";

const SEARCH_SETTLE_MS = 1_000;

type SearchSurface = AnalyticsEvents["player_search"]["surface"];

// Sends one player_search once the user stops typing for a second. The query text is
// only included when `includeQuery` is on and it matched at least one player.
export function usePlayerSearchTracking(
  surface: SearchSurface,
  query: string,
  resultCount: number,
  { includeQuery = true }: { includeQuery?: boolean } = {},
) {
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) return;

    const timeoutId = window.setTimeout(() => {
      const matchedQuery = includeQuery
        ? getPlayerSearchQuery(trimmed, resultCount)
        : undefined;

      track("player_search", {
        surface,
        query_length: trimmed.length,
        result_count: resultCount,
        ...(matchedQuery ? { query: matchedQuery } : {}),
      });
    }, SEARCH_SETTLE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [surface, query, resultCount, includeQuery]);
}
