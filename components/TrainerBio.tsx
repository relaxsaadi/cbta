"use client";

import { CheckCircle, Globe } from "lucide-react";

const REVIEW_PRINCIPLES = [
  "Compétence du reviewer documentée avant admission dans le circuit de revue",
  "Reviewer nommé et date de revue pour tout statut APPROVED",
  "Vérification FR et revue EN distinctes lorsqu'elles sont requises",
  "Aucune affirmation de qualification externe sans preuve courante vérifiée",
];

export default function TrainerBio() {
  return (
    <section className="section bg-[#f7f9fc]">
      <div className="container-x max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#F39C12] mb-2">
            Revue du contenu
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A]">
            Une qualification doit être prouvée, pas supposée
          </h2>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
          <p className="text-gray-700 leading-relaxed mb-6 max-w-3xl">
            La plateforme ne doit pas transformer une biographie commerciale en preuve de qualification réglementaire. Les reviewers, instructeurs ou évaluateurs utilisés dans un circuit d'approbation doivent disposer des justificatifs exigés par le programme de gouvernance applicable avant que leur validation ne soit considérée comme suffisante.
          </p>
          <ul className="space-y-3 text-sm">
            {REVIEW_PRINCIPLES.map((item) => (
              <li key={item} className="flex items-start gap-2 text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 mt-6 flex items-center gap-2">
            <Globe className="h-4 w-4" aria-hidden />
            Toute qualification IATA, ANAC ou autre autorité doit être vérifiée dans sa source courante avant publication comme fait.
          </p>
        </div>
      </div>
    </section>
  );
}
