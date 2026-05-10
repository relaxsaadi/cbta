"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/tracking";

export default function ScrollTracker() {
  useEffect(() => {
    trackEvent("view_landing", { path: window.location.pathname });

    const fired = { 50: false, 90: false };
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = (scrollTop / docHeight) * 100;
      if (!fired[50] && pct >= 50) {
        fired[50] = true;
        trackEvent("scroll_50");
      }
      if (!fired[90] && pct >= 90) {
        fired[90] = true;
        trackEvent("scroll_90");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
