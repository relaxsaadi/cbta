import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "IATA Dangerous Goods Training Algeria — CBTA Certified Provider",
  description:
    "Official IATA DGR-CBTA training in Algeria. First IATA CBTA Provider certified in Algeria. Classroom or in-house sessions. Globally recognized IATA certificate. Compliant with ANAC Algeria & ICAO.",
  alternates: { canonical: "/iata-dangerous-goods-training-algeria" },
  keywords: [
    "IATA dangerous goods training Algeria",
    "IATA DGR training Algeria",
    "CBTA dangerous goods Algeria",
    "hazmat training Algeria",
    "IATA certified training Algeria",
  ],
  openGraph: {
    title: "IATA DGR Training Algeria — KOST GROUP CBTA Provider",
    description:
      "First IATA CBTA certified training center in Algeria. DGR training for freight forwarders, airlines and cargo agents.",
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
      }}
    />
  );
}
