import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "DGR / CBTA training in Algeria — KOST GROUP",
  description:
    "DGR / CBTA training options in Algeria based on actual duties. Scope, authorizations, assessment and delivery conditions require verification before enrollment.",
  alternates: { canonical: "/iata-dangerous-goods-training-algeria" },
  keywords: [
    "IATA dangerous goods training Algeria",
    "IATA DGR training Algeria",
    "CBTA dangerous goods Algeria",
    "hazmat training Algeria",
    "IATA certified training Algeria",
  ],
  openGraph: {
    title: "DGR / CBTA training Algeria — KOST GROUP",
    description:
      "Dangerous-goods training scoped to actual tasks and applicable requirements. No automatic recognition or on-site delivery is guaranteed.",
    url: "https://dgr.kostacademy.com/iata-dangerous-goods-training-algeria",
  },
};

export default function Page() {
  return (
    <CountryLandingPage
      data={{
        slug: "iata-dangerous-goods-training-algeria",
        pays: "Algeria",
        paysPreposition: "in",
        capitale: "Algiers",
        autoriteRegionale: "ANAC Algeria (National Civil Aviation Authority)",
        codeIso: "DZ",
        langue: "en",
        savingsVsParis: 0,
        keyFeature: "Training scope and delivery require task-based needs assessment",
        localContext: {
          title: "IATA DGR compliance in Algeria: regulatory framework and international operators",
          paragraphs: [
            "Applicable dangerous-goods air-transport requirements depend on the actual tasks performed, current authoritative sources, the relevant national authority and operators' procedures. A CBTA function cannot be assigned solely from a job title.",
            "KOST can assess a training request subject to current rules and any local authorizations. Location, dates, price, assessment, certificate wording and acceptance conditions require a confirmed written proposal; no universal IATA or national-authority recognition is promised.",
          ],
          aeroports: [
            "Houari Boumediene — Algiers (ALG)",
            "Ahmed Ben Bella — Oran (ORN)",
            "Mohamed Boudiaf — Constantine (CZL)",
            "Rabah Bitat — Annaba (AAE)",
            "Krim Belkacem — Hassi Messaoud (HME)",
          ],
        },
      }}
    />
  );
}
