import { PackageX, AlertTriangle, TrendingDown } from "lucide-react";

const POINTS = [
  {
    icon: PackageX,
    title: "Cargo refusé à l'embarquement",
    desc: "Sans certificat DGR-CBTA valide, vos expéditions sont systématiquement bloquées en acceptation. Pertes financières immédiates.",
  },
  {
    icon: AlertTriangle,
    title: "Amendes IATA et suspension",
    desc: "Les compagnies aériennes appliquent des sanctions strictes en cas de manquement à la formation CBTA, jusqu'à la suspension du compte expéditeur.",
  },
  {
    icon: TrendingDown,
    title: "Perte de contrats face aux concurrents",
    desc: "Vos concurrents certifiés gagnent les appels d'offres. Vous perdez des marchés pour un certificat à quelques jours de formation.",
  },
];

export default function ProblemSection() {
  return (
    <section className="section bg-gray-50">
      <div className="container-x">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#0f1c2e] mb-3">
          Sans certificat DGR-CBTA valide, votre activité s'arrête
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Trois risques majeurs auxquels font face quotidiennement les acteurs du fret aérien et de l'aviation civile en Afrique francophone.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {POINTS.map((p) => (
            <div
              key={p.title}
              className="card border-l-4 border-l-red-500 hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 text-red-600 mb-4">
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
