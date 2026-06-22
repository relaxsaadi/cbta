import type { Metadata } from "next";
import PlanningPage from "@/components/PlanningPage";

export const metadata: Metadata = {
  title: "Planning Sessions IATA DGR 2026 — KOST GROUP",
  description:
    "Planning complet des sessions de formation IATA DGR CBTA 2026 à Alger. 29 sessions de juillet à décembre. Réservation via WhatsApp. Certificat IATA officiel.",
  alternates: { canonical: "/planning" },
  openGraph: {
    title: "Planning Sessions IATA DGR 2026 — KOST GROUP",
    description:
      "29 sessions IATA DGR CBTA à Alger · Juillet–Décembre 2026 · Réservation immédiate via WhatsApp.",
    url: "/planning",
  },
};

export default function Page() {
  return <PlanningPage />;
}
