import { Check } from "lucide-react";

const ITEMS = [
  "Périmètre de formation confirmé après analyse des tâches",
  "Programme communiqué sur la fonction et les sources validées",
  "Modalités d'évaluation précisées dans la proposition applicable",
  "Éléments inclus et supports confirmés avant commande",
  "Prix, durée et organisation indiqués dans un devis à jour",
];

export default function IncludedSection() {
  return (
    <section className="section bg-gray-50">
      <div className="container-x">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-2">
              Proposition cadrée
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f1c2e]">
              Ce qui doit être confirmé avant inscription
            </h2>
          </div>
          <div className="card border-2 border-[#003D7A]/10 shadow-lg p-8 md:p-10">
            <ul className="space-y-4">
              {ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F39C12] text-white mt-0.5">
                    <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="text-gray-800 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-gray-500 leading-relaxed">
              Aucun examen « officiel », certificat, manuel, avantage tarifaire ou contenu inclus n'est promis par défaut sur cette page sans preuve et confirmation applicables à la proposition concernée.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
