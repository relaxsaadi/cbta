import { FileSearch, Layers3, Languages, UserCheck } from "lucide-react";

const USPS = [
  {
    icon: Layers3,
    title: "Fonctions traitées indépendamment",
    desc: "Les fonctions 7.1 à 7.10 sont dérivées de leurs propres tables de tâches et jeux de sources. La structure de 7.1 n'est pas copiée mécaniquement.",
  },
  {
    icon: FileSearch,
    title: "Traçabilité des preuves",
    desc: "Les affirmations réglementaires destinées à la production doivent être reliées à une preuve courante faisant autorité ; les manques et contradictions restent explicites.",
  },
  {
    icon: Languages,
    title: "Vérifications linguistiques séparées",
    desc: "La vérification FR et la revue technique EN sont distinctes lorsqu'elles sont requises. Une traduction ne remplace pas une revue bilingue.",
  },
  {
    icon: UserCheck,
    title: "Approbation attribuable",
    desc: "Un contenu ne reçoit pas le statut APPROVED sans reviewer qualifié nommé et date de revue, avec une chaîne d'approbation auditable.",
  },
];

export default function USPSection() {
  return (
    <section className="section bg-white">
      <div className="container-x">
        <div className="text-center mb-12">
          <span className="inline-block text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-2">
            Méthode KOST GROUP
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f1c2e]">
            Gouvernance du contenu DGR / CBTA
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {USPS.map((u) => (
            <div key={u.title} className="card hover:shadow-lg transition-shadow flex gap-4">
              <div className="shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#003D7A] text-[#F39C12]">
                <u.icon className="h-7 w-7" aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#003D7A]">{u.title}</h3>
                <p className="text-gray-600 leading-relaxed">{u.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
