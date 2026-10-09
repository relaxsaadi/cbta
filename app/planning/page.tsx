import type { Metadata } from "next";
import PlanningPage from "@/components/PlanningPage";

export const metadata: Metadata = {
  title: "Planning indicatif des formations DGR/CBTA — Alger",
  description:
    "Planning indicatif des formations DGR/CBTA à Alger. Dates, tarifs, durées et disponibilités à confirmer avant inscription.",
  alternates: { canonical: "/planning" },
  openGraph: {
    title: "Planning indicatif des formations DGR/CBTA — Alger",
    description:
      "Planning indicatif DGR/CBTA à Alger · Dates, tarifs, durées et disponibilités à confirmer avant inscription.",
    url: "/planning",
  },
};

export default function Page() {
  return <PlanningPage />;
}
