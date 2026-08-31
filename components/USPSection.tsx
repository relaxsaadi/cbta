import { Award, Globe, Users, FileCheck } from "lucide-react";

const USPS = [
  {
    icon: Award,
    title: "Formation DGR méthode CBTA en Algérie",
    desc: "Formation dispensée localement en Algérie, selon la méthode CBTA (Competency-Based Training and Assessment).",
  },
  {
    icon: Globe,
    title: "Même méthode qu'à Bruxelles",
    desc: "Même méthode CBTA que dans les centres européens, mais à 50% du prix.",
  },
  {
    icon: Users,
    title: "Formateurs internationaux expérimentés",
    desc: "Instructeurs ayant suivi le cursus Train-the-Trainer IATA, avec expérience opérationnelle en compagnie aérienne et fret.",
  },
  {
    icon: FileCheck,
    title: "Paiement sécurisé via STRATEGIX",
    desc: "Facturation officielle EUR ou USD via notre entité française STRATEGIX. Conforme pour les services financiers de votre entreprise.",
  },
];

export default function USPSection() {
  return (
    <section className="section bg-white">
      <div className="container-x">
        <div className="text-center mb-12">
          <span className="inline-block text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-2">
            Pourquoi KOST GROUP
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f1c2e]">
            Le bon choix pour votre certification IATA
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {USPS.map((u) => (
            <div
              key={u.title}
              className="card hover:shadow-lg transition-shadow flex gap-4"
            >
              <div className="shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#003D7A] text-[#F39C12]">
                <u.icon className="h-7 w-7" aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#003D7A]">
                  {u.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{u.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
