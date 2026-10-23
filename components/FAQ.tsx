"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "Est-ce reconnu dans mon pays (Maroc, Sénégal, Tunisie, Côte d'Ivoire) ?",
    a: "La reconnaissance d'une formation ou d'un certificat DGR dépend du programme, des exigences applicables et des organismes concernés. Vérifiez les conditions auprès de l'autorité et des exploitants pertinents ; aucune reconnaissance universelle n'est présumée.",
  },
  {
    q: "Comment payer depuis l'Afrique ?",
    a: "Plusieurs options : virement bancaire EUR ou USD vers notre compte STRATEGIX (entité française), ou virement local en Algérie. Nous émettons une facture officielle conforme aux exigences comptables de votre pays. Paiements échelonnés possibles pour les groupes.",
  },
  {
    q: "Faut-il venir en Algérie ?",
    a: "Pas nécessairement. Nous organisons des sessions à Alger, mais aussi des formations intra-entreprise (nous nous déplaçons dans votre pays) à partir de 6 participants. Demandez le devis intra dans le formulaire.",
  },
  {
    q: "Le certificat est-il valable combien de temps ?",
    a: "Les exigences de maintien des compétences et les éventuelles échéances doivent être vérifiées pour la fonction exercée, le programme suivi et les règles applicables. Une validité universelle de 24 mois ou un examen officiel IATA ne peuvent pas être présumés pour chaque parcours.",
  },
  {
    q: "Peut-on commencer sans expérience préalable en marchandises dangereuses ?",
    a: "Cela dépend des prérequis du parcours et des tâches visées. Une évaluation préalable permet d'orienter le participant vers la formation initiale ou de maintien des compétences adaptée, sans garantir un niveau expert ni attribuer automatiquement une fonction 7.1 à 7.10.",
  },
  {
    q: "Quelle différence entre une formation matières dangereuses générale et la formation DGR IATA ?",
    a: "Les formations généralistes HSE, stockage ou ADR et les formations DGR pour le fret aérien n'ont pas le même périmètre. Les besoins de formation DGR/CBTA sont déterminés à partir des tâches réellement exercées et des exigences applicables ; le seul intitulé de poste ne suffit pas pour sélectionner une fonction 7.1 à 7.10. Les conditions d'examen et la reconnaissance éventuelle d'un certificat doivent être vérifiées selon le parcours concerné.",
  },
  {
    q: "Vous déplacez-vous pour les formations intra-entreprise ?",
    a: "Oui, à partir de 6 participants nous nous déplaçons dans tous les pays d'Afrique francophone. Nous prenons en charge le formateur, les supports, l'examen IATA officiel. Vous fournissez la salle et la logistique locale.",
  },
  {
    q: "Quels sont les délais d'inscription ?",
    a: "Les sessions ouvrent toutes les 4 à 6 semaines. Le délai conseillé entre inscription et formation est de 2 semaines pour valider le paiement et l'émission de la facture. Sessions urgentes possibles sur demande.",
  },
  {
    q: "La formation est en français ou en anglais ?",
    a: "Les deux. Sessions standards en français. Nous proposons aussi des sessions en anglais sur demande, notamment pour les compagnies aériennes opérant en environnement bilingue.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section bg-white">
      <div className="container-x">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-2">
              Questions fréquentes
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f1c2e]">
              On répond à vos questions
            </h2>
          </div>
          <div className="space-y-3">
            {ITEMS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-[#0f1c2e]">{item.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#003D7A] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-${i}`}
                      className="px-5 pb-5 text-gray-600 leading-relaxed"
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
