import { BadgeCheck, ExternalLink } from "lucide-react";
import {
  MENTION_EN,
  MENTION_FR,
  ONLY_ANAC_EN,
  ONLY_ANAC_FR,
  ONLY_IATA_EN,
  ONLY_IATA_FR,
  PROOF,
} from "@/lib/kost-facts";

type Props = {
  lang?: "fr" | "en";
  /** "dark" for use on the blue hero background, "light" on white sections. */
  tone?: "dark" | "light";
  /** Show the "Nos agréments" heading. */
  withHeading?: boolean;
};

/**
 * "Nos agréments": the two allowed "only" formulas, each followed by its proof
 * link, plus the mandatory ANAC mention. Server component, no client JS.
 */
export default function Accreditations({ lang = "fr", tone = "light", withHeading = true }: Props) {
  const en = lang === "en";
  const dark = tone === "dark";
  const box = dark
    ? "rounded-2xl border border-white/20 bg-white/10 p-4 md:p-5 text-white"
    : "rounded-2xl border border-[#003D7A]/15 bg-[#f4f8fc] p-5 md:p-6 text-[#0f1c2e]";
  const link = dark
    ? "inline-flex items-center gap-1 font-semibold text-[#F9C46B] underline underline-offset-2"
    : "inline-flex items-center gap-1 font-semibold text-[#003087] underline underline-offset-2";
  const icon = dark ? "text-[#F39C12]" : "text-[#003D7A]";

  return (
    <section aria-label={en ? "Our approvals" : "Nos agréments"} className={box}>
      {withHeading ? (
        <h2 className={`text-base md:text-lg font-extrabold mb-3 ${dark ? "text-white" : "text-[#003D7A]"}`}>
          {en ? "Our approvals" : "Nos agréments"}
        </h2>
      ) : null}
      <ul className="space-y-2 text-sm md:text-base leading-relaxed">
        <li className="flex gap-2">
          <BadgeCheck className={`h-5 w-5 shrink-0 mt-0.5 ${icon}`} aria-hidden />
          <span>
            {en ? "KOST Academy is " : "KOST Academy est le "}
            <strong>{en ? ONLY_IATA_EN : ONLY_IATA_FR}</strong>.{" "}
            <a href={PROOF.iata} target="_blank" rel="noopener" className={link}>
              {en ? "See the IATA registry" : "Voir le registre IATA"}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </span>
        </li>
        <li className="flex gap-2">
          <BadgeCheck className={`h-5 w-5 shrink-0 mt-0.5 ${icon}`} aria-hidden />
          <span>
            {en ? "KOST Academy is " : "KOST Academy est le "}
            <strong>{en ? ONLY_ANAC_EN : ONLY_ANAC_FR}</strong>.{" "}
            <a href={en ? PROOF.anacEn : PROOF.anacFr} target="_blank" rel="noopener" className={link}>
              {en ? "See the ANAC list" : "Voir la liste ANAC"}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </span>
        </li>
      </ul>
      <p className={`mt-3 text-xs md:text-sm ${dark ? "text-white/80" : "text-gray-600"}`}>
        {en ? MENTION_EN.charAt(0).toUpperCase() + MENTION_EN.slice(1) : MENTION_FR.charAt(0).toUpperCase() + MENTION_FR.slice(1)}.
      </p>
    </section>
  );
}
