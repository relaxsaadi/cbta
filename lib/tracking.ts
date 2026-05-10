declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    lintrk?: (action: string, params: Record<string, unknown>) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const isClient = () => typeof window !== "undefined";

export const DEFAULT_LEAD_VALUE = 1000;

export function trackEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): void {
  if (!isClient()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
}

export type LeadData = {
  email?: string;
  pays?: string;
  formation?: string;
  leadValue?: number;
  transactionId?: string;
};

export function trackLead(data: LeadData): void {
  if (!isClient()) return;

  const value = data.leadValue ?? DEFAULT_LEAD_VALUE;
  const txId = data.transactionId;

  // GA4 / GTM dataLayer event
  trackEvent("generate_lead", {
    currency: "EUR",
    value,
    lead_value: value,
    country: data.pays,
    formation: data.formation,
    transaction_id: txId,
  });

  // Google Ads conversion (snippet path)
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const adsLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (window.gtag && adsId && adsLabel) {
    window.gtag("event", "conversion", {
      send_to: `${adsId}/${adsLabel}`,
      value,
      currency: "EUR",
      transaction_id: txId,
    });
  }

  // LinkedIn conversion
  const linkedInConvId = process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_ID;
  if (window.lintrk && linkedInConvId) {
    const conversionId = Number(linkedInConvId);
    if (!Number.isNaN(conversionId)) {
      window.lintrk("track", { conversion_id: conversionId });
    }
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "Lead", {
      value,
      currency: "EUR",
    });
  }
}

export function trackPageView(params: Record<string, unknown> = {}): void {
  trackEvent("page_view_custom", params);
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
