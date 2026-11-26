"use client";

import { useEffect } from "react";

/**
 * Loads Google Tag Manager, the LinkedIn Insight Tag and the Meta Pixel only
 * after the first user interaction, or once the browser is idle (max ~4 s after
 * load). Keeps third-party JS off the critical path for mobile LCP/TBT.
 *
 * window.dataLayer is created immediately so events pushed by lib/tracking.ts
 * before GTM arrives are queued and processed once GTM loads.
 */

// window.dataLayer / lintrk / fbq are typed in lib/tracking.ts; the loader
// manipulates their queue internals through this loose view.
type LooseWindow = Window & {
  _linkedin_partner_id?: string;
  _linkedin_data_partner_ids?: string[];
  lintrk?: ((...args: unknown[]) => void) & { q?: unknown[] };
  fbq?: ((...args: unknown[]) => void) & {
    callMethod?: (...args: unknown[]) => void;
    queue?: unknown[];
    push?: unknown;
    loaded?: boolean;
    version?: string;
  };
  _fbq?: unknown;
  __kostThirdPartiesLoaded?: boolean;
};

function addScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadAll(gtmId?: string, linkedInId?: string, metaPixelId?: string) {
  const window = globalThis.window as unknown as LooseWindow;
  if (window.__kostThirdPartiesLoaded) return;
  window.__kostThirdPartiesLoaded = true;

  if (gtmId) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    addScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`);
  }

  if (linkedInId) {
    window._linkedin_partner_id = linkedInId;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(linkedInId);
    if (!window.lintrk) {
      const q: unknown[] = [];
      const fn = ((...args: unknown[]) => {
        q.push(args);
      }) as NonNullable<LooseWindow["lintrk"]>;
      fn.q = q;
      window.lintrk = fn;
    }
    addScript("https://snap.licdn.com/li.lms-analytics/insight.min.js");
  }

  if (metaPixelId && !window.fbq) {
    const queue: unknown[] = [];
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else queue.push(args);
    }) as NonNullable<LooseWindow["fbq"]>;
    fbq.queue = queue;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;
    addScript("https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", metaPixelId);
    fbq("track", "PageView");
  }
}

export default function LazyThirdParties() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const linkedInId = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  useEffect(() => {
    if (!gtmId && !linkedInId && !metaPixelId) return;
    window.dataLayer = window.dataLayer || [];

    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const trigger = () => {
      cleanup();
      loadAll(gtmId, linkedInId, metaPixelId);
    };

    function cleanup() {
      events.forEach((name) => window.removeEventListener(name, trigger));
      if (idleHandle !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    }

    events.forEach((name) => window.addEventListener(name, trigger, { once: true, passive: true }));

    // No interaction: wait 3.5 s after load, then the next idle period.
    const scheduleIdle = () => {
      timeoutHandle = window.setTimeout(() => {
        if ("requestIdleCallback" in window) {
          idleHandle = window.requestIdleCallback(trigger, { timeout: 2000 });
        } else {
          trigger();
        }
      }, 3500);
    };

    if (document.readyState === "complete") scheduleIdle();
    else window.addEventListener("load", scheduleIdle, { once: true });

    return () => {
      cleanup();
      window.removeEventListener("load", scheduleIdle);
    };
  }, [gtmId, linkedInId, metaPixelId]);

  return null;
}
