import { FileWarning, Workflow, ShieldAlert } from "lucide-react";

const POINTS = [
  {
    icon: FileWarning,
    title: "Mauvaise fonction attribuée",
    desc: "Associer automatiquement un poste ou un secteur à une fonction 7.x peut produire un mauvais périmètre de formation et une banque de questions non défendable.",
  },
  {
    icon: Workflow,
    title: "Preuve réglementaire incomplète",
    desc: "Une affirmation sans source courante directement pertinente doit rester SOURCE GAP ; une contradiction doit rester SOURCE CONFLICT jusqu'à résolution.",
  },
  {
    icon: ShieldAlert,
    title: "Approbation non traçable",
    desc: "Un contenu marqué APPROVED sans reviewer qualifié nommé, date de revue et chaîne d'approbation vérifiable compromet l'auditabilité de la banque.",
  },
];

export default function ProblemSection() {
  return (
    <section className="section bg-gray-50">
      <div className="container-x">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#0f1c2e] mb-3">
          Les risques que la gouvernance doit empêcher
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          La plateforme doit distinguer clairement le cadrage commercial, les exigences techniques et les preuves réglementaires avant toute promotion en production.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {POINTS.map((p) => (
            <div key={p.title} className="card border-l-4 border-l-[#F39C12] hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 text-amber-700 mb-4">
                <p.icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="text-xl font-bold mb-2">{p.title}</h3>
              <p className="text-gray-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
