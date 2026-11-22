import { redirect } from "next/navigation";

// The August/September 2026 campaign has expired. Keep incoming links
// functional without presenting old dates, invented scarcity or a
// purported universal IATA deadline as current requirements.
export default function SessionAoutPage() {
  redirect("/planning");
}
