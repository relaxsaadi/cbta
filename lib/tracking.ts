declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    lintrk?: (action: string, params: Record<string, unknown>) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const isClient = () => typeof window !== "undefined";

export function trackEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): void {
  if (!isClient()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
}

export type LeadData = {
  email: string;
  pays?: string;
  formation?: string;
  prixEur?: number;
};

export function trackLead(data: LeadData): void {
  if (!isClient()) return;

  trackEvent("generate_lead", {
    currency: "EUR",
    value: data.prixEur ?? 1200,
    pays: data.pays,
    formation: data.formation,
  });

  // Google Ads conversion
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const adsLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (window.gtag && adsId && adsLabel) {
    window.gtag("event", "conversion", {
      send_to: `${adsId}/${adsLabel}`,
      value: data.prixEur ?? 1200,
      currency: "EUR",
    });
  }

  // LinkedIn conversion
  if (window.lintrk) {
    window.lintrk("track", { conversion_id: 0 });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "Lead", {
      currency: "EUR",
      value: data.prixEur ?? 1200,
    });
  }
}

export function trackPhoneClick(): void {
  trackEvent("click_phone");
}

export function trackWhatsApp(location: string = "default"): void {
  trackEvent("click_whatsapp", { location });
}

export function trackPricingCta(formation: string): void {
  trackEvent("click_pricing_cta", { formation });
}

export function trackFormStart(): void {
  trackEvent("form_start");
}

export function trackFormSubmitAttempt(): void {
  trackEvent("form_submit_attempt");
}

export function trackFormSubmitError(error: string): void {
  trackEvent("form_submit_error", { error });
}
