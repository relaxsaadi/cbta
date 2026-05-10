import { Check } from "lucide-react";

const ITEMS = [
  { text: "Formation présentielle 4-5 jours avec formateur IATA certifié", value: "2 250 €" },
  { text: "Manuel IATA DGR 2026 (67e édition) inclus", value: "200 €" },
  { text: "Examen IATA officiel CBTA inclus", value: "✓" },
  { text: "Certificat IATA numérique vérifiable en ligne", value: "✓" },
  { text: "Exercices pratiques et cas réels", value: "✓" },
  { text: "Facturation officielle France ou Algérie", value: "✓" },
  { text: "Hébergement et restauration inclus pour multi-jours (sur demande)", value: "✓" },
];

export default function IncludedSection() {
  return (
    <section className="section bg-gray-50">
      <div className="container-x">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-2">
              Tout compris
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f1c2e]">
              Ce qui est inclus dans votre formation
            </h2>
          </div>
          <div className="card border-2 border-[#003D7A]/10 shadow-lg p-8 md:p-10">
            <ul className="space-y-4 mb-8">
              {ITEMS.map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F39C12] text-white mt-0.5">
                    <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="flex-1 text-gray-800 leading-relaxed">
                    {item.text}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-gray-500">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
            <div className="bg-gradient-to-r from-[#003D7A] to-[#002A56] rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-white/60">
                  Valeur totale
                </div>
                <div className="text-2xl font-bold line-through opacity-80">
                  2 450 €
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#F39C12]">→</div>
              <div>
                <div className="text-xs uppercase tracking-wider text-[#F39C12]">
                  Prix KOST
                </div>
                <div className="text-3xl font-extrabold">1 800 €</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
