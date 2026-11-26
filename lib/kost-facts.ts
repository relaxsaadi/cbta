/**
 * Single source of truth for public business facts, approval wording and
 * proof links. Every visitor-facing template, JSON-LD block, llms.txt and the
 * sitemap must read from here so the wording stays identical everywhere.
 *
 * Wording rules (validated by Saadi, 2026-11-26):
 * - Allowed "only" claims MUST be shown next to their proof link.
 * - Never: premier/first, unique, certifiée IATA/IATA-certified, 300+,
 *   monopole/monopoly, or any IATA expiry date.
 */

export const SITE_URL = "https://dgr.kostacademy.com";

export const LEGAL_NAME = "EURL KOST GROUPE";
export const BRAND_NAME = "KOST Academy";
export const CONTACT_EMAIL = "cbta@kostacademy.com";

export const ADDRESS = {
  street: "Cité Boushaki F n°176",
  district: "Bab Ezzouar",
  postalCode: "16024",
  city: "Alger",
  cityEn: "Algiers",
  country: "DZ",
} as const;

/** Visible address, identical on every page. */
export const ADDRESS_LINE_FR = "Cité Boushaki F n°176, Bab Ezzouar, 16024 Alger";
export const ADDRESS_LINE_EN = "Cité Boushaki F n°176, Bab Ezzouar, 16024 Algiers, Algeria";

/** One set of GPS coordinates, reused by every schema. */
export const GEO = { latitude: 36.71942, longitude: 3.18274 } as const;

export const ANAC_REF = "ANAC/DSOA/SAL-DGR/01/2026";

export const PROOF = {
  iata: "https://www.iata.org/en/services/certification/training-development/cbta-center/cbta-certified-companies/eurl-kost-group/1276394/",
  anacFr: "https://www.anac.dz/fr/ecoles-de-formation/",
  anacEn: "https://www.anac.dz/en/training-schools/",
} as const;

/** Mandatory mention (exact wording). */
export const MENTION_FR = `centre CBTA référencé IATA, agréé ANAC pour les fonctions 7.1 à 7.10, réf. ${ANAC_REF}`;
export const MENTION_EN = `IATA-referenced CBTA centre, approved by ANAC for functions 7.1 to 7.10, ref. ${ANAC_REF}`;

/** Allowed "only" formulas — always rendered with their proof link. */
export const ONLY_IATA_FR = "seul centre CBTA en Algérie référencé par l'IATA";
export const ONLY_ANAC_FR = "seul organisme de formation DGR agréé par l'ANAC en Algérie";
export const ONLY_IATA_EN = "the only IATA-referenced CBTA centre in Algeria";
export const ONLY_ANAC_EN = "the only DGR training organisation approved by ANAC in Algeria";

export const BILLING_DZ_FR = "Facturation par EURL KOST GROUPE, en DA";
export const BILLING_DZ_EN = "Invoiced by EURL KOST GROUPE, in DA";

export const WHATSAPP_E164 = "213542305383";
export const WHATSAPP_DISPLAY = "+213 542 30 53 83";

export function whatsAppHref(message: string): string {
  return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(message)}`;
}

/** Same-as links for Organization schema (proofs first). */
export const SAME_AS = [
  PROOF.iata,
  PROOF.anacFr,
  "https://www.linkedin.com/company/kost-group",
  "https://www.facebook.com/p/Kost-Groupe-Academy-100067440295455/",
  "https://maps.app.goo.gl/oqJqBNFpBHTSL83d7",
];

/** Price in Algerian dinars, comma thousands separator: 500,400 DA. */
export function formatDa(amount: number): string {
  return `${amount.toLocaleString("en-US")} DA`;
}

export function postalAddressSchema() {
  return {
    "@type": "PostalAddress",
    streetAddress: `${ADDRESS.street}, ${ADDRESS.district}`,
    addressLocality: ADDRESS.city,
    postalCode: ADDRESS.postalCode,
    addressCountry: ADDRESS.country,
  };
}

export function geoSchema() {
  return { "@type": "GeoCoordinates", latitude: GEO.latitude, longitude: GEO.longitude };
}

/** Provider object embedded in Course schemas. */
export function providerSchema() {
  return {
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    address: postalAddressSchema(),
    geo: geoSchema(),
    sameAs: SAME_AS,
  };
}
