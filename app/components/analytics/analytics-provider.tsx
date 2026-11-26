"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { loadAnalytics, trackPageview } from "../../lib/analytics";

const IDLE_TIMEOUT_MS = 3_000;

// Loads PostHog once the page is interactive and idle, so it never competes with the
// page's own loading, and sends a $pageview for real navigations only: it follows the
// pathname, so a ?mode toggle (history.replaceState on the same path) isn't a pageview.
export function AnalyticsProvider() {
  const pathname = usePathname();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    let idleId: number | null = null;
    let timeoutId: number | null = null;

    const start = () => {
      const run = () => void loadAnalytics();

      // Safari doesn't support requestIdleCallback; fall back to a short delay.
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS });
      } else {
        timeoutId = window.setTimeout(run, 1_500);
      }
    };

    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }

    return () => {
      window.removeEventListener("load", start);
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    // Once per pathname (also guards against effects running twice in development).
    if (lastTrackedPathRef.current === pathname) return;

    lastTrackedPathRef.current = pathname;
    trackPageview();
  }, [pathname]);

  return null;
}
