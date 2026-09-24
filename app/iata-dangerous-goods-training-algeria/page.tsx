import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "DGR / CBTA Training Algeria — Function-by-Function Scope",
  description:
    "DGR / CBTA training in Algeria. Functions 7.1 through 7.10 are scoped from actual duties, current applicable sources and the required review path for each function.",
  alternates: { canonical: "/iata-dangerous-goods-training-algeria" },
  keywords: [
    "dangerous goods training Algeria",
    "DGR training Algeria",
    "CBTA Algeria",
    "hazmat training Algeria",
    "air cargo dangerous goods Algeria",
  ],
  openGraph: {
    title: "DGR / CBTA Training Algeria — Function-by-Function Scope",
    description:
      "DGR / CBTA 7.1–7.10 training in Algeria with scope determined from duties and applicable sources. No job title is automatically mapped to a DGR function.",
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
      }}
    />
  );
}
