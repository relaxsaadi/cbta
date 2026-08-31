import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "IATA Dangerous Goods Training Algeria | DGR Courses",
  description:
    "DGR training in Algeria covering IATA DGR topics, using a CBTA approach. Classroom or in-house sessions available. Contact us for a free quote within 24h.",
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
      "DGR training in Algeria covering IATA DGR topics for freight forwarders, airlines and cargo agents, using a CBTA approach.",
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
          "Professional training, experienced instructor, thorough CBTA-based assessment. Our entire team completed the training in 4 days without traveling to Europe. Highly recommended.",
        keyFeature: "DGR training delivered locally in Algeria, using the CBTA approach",
        localContext: {
          title: "IATA DGR compliance in Algeria: regulatory framework and international operators",
          paragraphs: [
            "Dangerous goods air transport in Algeria is regulated by ANAC Algeria (National Civil Aviation Authority), in line with ICAO Annex 18 and the IATA Dangerous Goods Regulations. Any organization handling, accepting or shipping dangerous goods by air from Algerian territory — whether a local freight forwarder or the Algeria-based branch of an international company — must hold a valid IATA DGR certification, renewed every 24 months.",
            "Algiers Houari Boumediene International Airport is the country's main international freight gateway, connecting Algeria to Europe, the Middle East and the rest of Africa. Foreign airlines and their ground-handling partners operating cargo flights to and from Algeria require their agents to hold a valid IATA DGR certificate — the same training standard applies whether it was completed in Algiers, Paris or Dubai.",
            "Algeria's economy is heavily oriented toward oil and gas exports, and international operators working with local partners — including logistics providers serving the Hassi Messaoud production basin — routinely ship samples, chemicals and pressurized equipment classified as dangerous goods. Certified DGR staff are essential to keep shipments compliant and avoid delays at acceptance or customs.",
            "KOST GROUP delivers DGR training locally in Algiers, using the CBTA approach, avoiding the cost and downtime of sending staff abroad, at a significantly lower cost than training in Paris or Brussels.",
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
