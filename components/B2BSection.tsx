"use client";

import { trackWhatsApp } from "@/lib/tracking";

const SECTORS = [
  {
    icon: "✈️",
    name: "Aviation & cargo",
    description: "Identifier les tâches réellement exercées dans l'acceptation, la manutention, l'exploitation ou d'autres activités pertinentes avant de déterminer le périmètre DGR.",
  },
  {
    icon: "📦",
    name: "Logistique & transit",
    description: "Analyser les responsabilités opérationnelles, les flux et les exigences opérateur sans associer automatiquement un métier à une fonction 7.x.",
  },
  {
    icon: "🏭",
    name: "Industrie, énergie & santé",
    description: "Qualifier les produits, tâches et modes d'expédition, puis vérifier les sources applicables avant toute conclusion réglementaire ou commerciale.",
  },
];

const ADVANTAGES = [
  "Analyse des tâches avant attribution d'une fonction",
  "Fonctions 7.1–7.10 traitées depuis leurs propres tables de tâches et sources",
  "SOURCE GAP / SOURCE CONFLICT conservés jusqu'à résolution",
  "Proposition établie après validation du périmètre et des modalités",
];

const WHATSAPP_URL =
  "https://wa.me/213542305383?text=Bonjour%2C%20je%20souhaite%20un%20cadrage%20DGR%20%2F%20CBTA%20pour%20mon%20entreprise";

export default function B2BSection() {
  return (
    <section className="bg-slate-900 py-20 px-4">
      <div className="container-x">
        <div className="text-center mb-14">
          <span className="inline-block text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-3">
            Entreprises & organisations
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Cadrage DGR / CBTA fondé sur les tâches
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Aucun client, agrément, exclusivité, sanction, catégorie ou fonction DGR n'est supposé à partir du seul secteur d'activité.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-14">
          {SECTORS.map((sector) => (
            <div key={sector.name} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-4xl mb-4">{sector.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{sector.name}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{sector.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-12">
          <h3 className="text-lg font-bold text-white text-center mb-6">Principes de proposition</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {ADVANTAGES.map((text) => (
              <div key={text} className="flex items-start gap-3">
                <span className="text-[#F39C12] font-bold">✓</span>
                <span className="text-slate-200 text-sm leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/#contact" className="inline-flex items-center justify-center bg-[#F39C12] hover:bg-[#e08e10] text-white font-bold py-4 px-8 rounded-xl transition-colors text-center">
            Demander un cadrage
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsApp("b2b_section")}
            className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl border border-white/20 transition-colors text-center"
          >
            WhatsApp — entreprise
          </a>
        </div>
      </div>
    </section>
  );
}
