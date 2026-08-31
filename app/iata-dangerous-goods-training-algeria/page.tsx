import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "IATA Dangerous Goods Training Algeria | DGR Courses",
  description:
    "IATA DGR training center based in Algeria. Classroom or in-house sessions, official IATA exam, CBTA training method. Contact us for a free quote within 24h.",
  alternates: { canonical: "/iata-dangerous-goods-training-algeria" },
  keywords: [
    "IATA dangerous goods training Algeria",
    "IATA DGR training Algeria",
    "CBTA dangerous goods Algeria",
    "hazmat training Algeria",
    "IATA DGR training courses Algeria",
  ],
  openGraph: {
    title: "IATA DGR Training Algeria — KOST GROUP",
    description:
      "IATA DGR training center in Algeria for freight forwarders, airlines and cargo agents.",
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
        savingsVsParis: 50,
        testimonialName: "Rachid B.",
        testimonialPoste: "Cargo Operations Manager",
        testimonialVille: "Algiers",
        testimonialText:
          "Professional training, certified IATA instructor, official CBTA examination. Our entire team got certified in 4 days without traveling to Europe. Highly recommended.",
        keyFeature: "The only IATA CBTA Provider certified center based in Algeria",
        localContext: {
          title: "IATA DGR compliance in Algeria: regulatory framework and international operators",
          paragraphs: [
            "Dangerous goods air transport in Algeria is regulated by ANAC Algeria (National Civil Aviation Authority), in line with ICAO Annex 18 and the IATA Dangerous Goods Regulations. Any organization handling, accepting or shipping dangerous goods by air from Algerian territory — whether a local freight forwarder or the Algeria-based branch of an international company — must hold a valid IATA DGR certification, renewed every 24 months.",
            "Algiers Houari Boumediene International Airport is the country's main international freight gateway, connecting Algeria to Europe, the Middle East and the rest of Africa. Foreign airlines and their ground-handling partners operating cargo flights to and from Algeria require their agents to hold IATA DGR certificates recognized across all 300+ IATA member carriers worldwide — the same standard applies whether the training was completed in Algiers, Paris or Dubai.",
            "Algeria's economy is heavily oriented toward oil and gas exports, and international operators working with local partners — including logistics providers serving the Hassi Messaoud production basin — routinely ship samples, chemicals and pressurized equipment classified as dangerous goods. Certified DGR staff are essential to keep shipments compliant and avoid delays at acceptance or customs.",
            "As the first and only IATA CBTA Provider certified training center based in Algeria, KOST GROUP delivers training locally in Algiers, avoiding the cost and downtime of sending staff abroad. Certificates issued are identical in standing to those delivered in Paris or Brussels, at a significantly lower cost, and are recognized by ANAC Algeria and every IATA member airline.",
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
