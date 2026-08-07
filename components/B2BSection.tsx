"use client";

import { trackWhatsApp } from "@/lib/tracking";

const SECTORS = [
  {
    icon: "🛢️",
    name: "Oil & Gas",
    clients: "Sonatrach, TotalEnergies",
    stat: "340+ agents formés/an",
    categories: "Cat. 7.4, 7.9",
    description:
      "Pétrole, gaz, produits chimiques inflammables — conformité IATA obligatoire pour les équipes fret et logistique.",
  },
  {
    icon: "✈️",
    name: "Aviation & Cargo",
    clients: "Air Algérie, compagnies aériennes",
    stat: "Obligation IOSA/ACC3",
    categories: "Cat. 7.3, 7.4, 7.6",
    description:
      "Acceptation, chargement et manutention des marchandises dangereuses — qualification requise pour rester en conformité IATA.",
  },
  {
    icon: "🏛️",
    name: "Secteur public & institutionnel",
    clients: "DGPC, ANAC, ministères",
    stat: "Décret 15-247 gré à gré",
    categories: "Cat. 7.1",
    description:
      "Seul centre CBTA Provider certifié IATA en Algérie — accréditation ANAC en cours de finalisation.",
  },
];

const ADVANTAGES = [
  {
    icon: "🚀",
    text: "Formateur KOST se déplace sur votre site",
  },
  {
    icon: "📍",
    text: "Session possible à Hassi Messaoud, Alger, partout en Algérie",
  },
  {
    icon: "🎓",
    text: "Certificats IATA CBTA individuels nominatifs",
  },
  {
    icon: "📄",
    text: "Devis sous 24h — facturation conforme marchés publics",
  },
];

const WHATSAPP_URL =
  "https://wa.me/213542305383?text=Bonjour%2C%20je%20souhaite%20une%20formation%20DGR%20intra-entreprise";

export default function B2BSection() {
  return (
    <section className="bg-slate-900 py-20 px-4">
      <div className="container-x">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-3">
            Grands comptes & entreprises
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Formation DGR Intra-Entreprise — Pour les Grands Comptes
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Sonatrach, Air Algérie, TotalEnergies, compagnies pétrolières —
            nous formons vos équipes directement sur site
          </p>
        </div>

        {/* Sector cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-14">
          {SECTORS.map((sector) => (
            <div
              key={sector.name}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#F39C12]/50 transition-colors"
            >
              <div className="text-4xl mb-4">{sector.icon}</div>
              <h3 className="text-xl font-bold text-white mb-1">
                {sector.name}
              </h3>
              <p className="text-slate-400 text-sm mb-4">{sector.clients}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-[#F39C12]/20 text-[#F39C12] text-xs font-semibold px-3 py-1 rounded-full">
                  {sector.stat}
                </span>
                <span className="bg-white/10 text-slate-300 text-xs font-semibold px-3 py-1 rounded-full">
                  {sector.categories}
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {sector.description}
              </p>
            </div>
          ))}
        </div>

        {/* Advantages grid */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-12">
          <h3 className="text-lg font-bold text-white text-center mb-6">
            Pourquoi choisir KOST GROUP pour votre formation intra ?
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {ADVANTAGES.map((adv) => (
              <div key={adv.text} className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{adv.icon}</span>
                <span className="text-slate-200 text-sm leading-relaxed">
                  {adv.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/#contact"
            className="inline-flex items-center justify-center gap-2 bg-[#F39C12] hover:bg-[#e08e10] text-white font-bold py-4 px-8 rounded-xl transition-colors text-center"
          >
            Demander un audit DGR gratuit
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsApp("b2b_section")}
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl border border-white/20 transition-colors text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-green-400"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.85L.057 23.786a.75.75 0 0 0 .916.934l6.104-1.6A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.001a9.946 9.946 0 0 1-5.031-1.366l-.36-.214-3.733.978.997-3.648-.234-.373A9.953 9.953 0 0 1 2 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10.001-10 10.001z" />
            </svg>
            WhatsApp — Devis intra-entreprise
          </a>
        </div>
      </div>
    </section>
  );
}
