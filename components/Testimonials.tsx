import { Star, User } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "[Témoignage à compléter]",
    role: "Responsable logistique cargo",
    country: "Maroc 🇲🇦",
    quote:
      "Formation très complète, formateurs experts du domaine. Le certificat IATA m'a permis de débloquer rapidement nos expéditions sensibles. Je recommande KOST GROUP pour tout acteur du fret aérien en Afrique.",
  },
  {
    name: "[Témoignage à compléter]",
    role: "DG Officer · Compagnie aérienne",
    country: "Sénégal 🇸🇳",
    quote:
      "Excellente alternative aux centres européens. Même qualité de formation, même certificat IATA, à un coût accessible. Notre équipe entière s'est formée chez KOST.",
  },
  {
    name: "[Témoignage à compléter]",
    role: "Cargo Manager · Freight forwarder",
    country: "Côte d'Ivoire 🇨🇮",
    quote:
      "La pédagogie est claire, les supports sont à jour avec la 67e édition IATA DGR. L'équipe administrative a géré sans accroc la facturation depuis Abidjan via leur entité française. Parfait.",
  },
];

export default function Testimonials() {
  return (
    <section className="section bg-gray-50">
      <div className="container-x">
        <div className="text-center mb-12">
          <span className="inline-block text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-2">
            Ils nous ont fait confiance
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f1c2e]">
            Témoignages d'apprenants
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="card hover:shadow-lg transition-shadow">
              <div className="flex gap-1 text-[#F39C12] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current"
                    aria-hidden
                  />
                ))}
              </div>
              <blockquote className="text-gray-700 leading-relaxed mb-6 italic">
                « {t.quote} »
              </blockquote>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#003D7A]/10 flex items-center justify-center text-[#003D7A]">
                  <User className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">
                    {t.role} · {t.country}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
