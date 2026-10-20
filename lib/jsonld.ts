export type FaqEntry = {
  q: string;
  a: string;
};

/** FAQPage JSON-LD built from the same strings rendered on the page. */
export function faqPageJsonLd(items: readonly FaqEntry[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  }).replace(/</g, "\\u003c");
}
