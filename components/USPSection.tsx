import { Award, Globe, Users, FileCheck } from "lucide-react";

const USPS = [
  {
    icon: Award,
    title: "Approche CBTA centrée sur les tâches",
    desc: "Le périmètre est établi à partir des activités réellement exercées, et non du seul intitulé de poste ou du secteur d'activité.",
  },
  {
    icon: Globe,
    title: "Sources et limites explicites",
    desc: "Les références, l'édition applicable et les éventuelles sources manquantes ou contradictoires sont identifiées avant validation du programme.",
  },
  {
    icon: Users,
    title: "Qualifications documentées",
    desc: "Les intervenants, leurs qualifications et leur périmètre sont présentés dans le programme avant la session.",
  },
  {
    icon: FileCheck,
    title: "Modalités contractuelles claires",
    desc: "Durée, prix, modalités d'évaluation et documents éventuellement délivrés sont précisés dans le devis et le programme.",
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
            Un accompagnement transparent pour votre formation
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
