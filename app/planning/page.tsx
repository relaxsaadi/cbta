import type { Metadata } from "next";
import PlanningPage from "@/components/PlanningPage";

export const metadata: Metadata = {
  title: "Sessions Formation DGR IATA 2026 — Tarifs & Disponibilités Alger",
  description:
    "29 sessions IATA DGR à Alger de juillet à décembre 2026. Tarifs en EUR et USD. Places limitées par session. Réservation immédiate via WhatsApp. Certificat IATA officiel.",
  alternates: { canonical: "/planning" },
  openGraph: {
    title: "Sessions Formation DGR IATA 2026 — Tarifs & Disponibilités Alger",
    description:
      "29 sessions IATA DGR à Alger · Juillet–Décembre 2026 · Tarifs EUR/USD · Places limitées · WhatsApp.",
    url: "/planning",
  },
};

export default function Page() {
  return <PlanningPage />;
}
