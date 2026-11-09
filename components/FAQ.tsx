"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "Est-ce reconnu dans mon pays (Maroc, Sénégal, Tunisie, Côte d'Ivoire) ?",
    a: "La reconnaissance dépend des exigences de chaque autorité, opérateur et employeur. Le périmètre et les modalités de la formation doivent être vérifiés avant inscription.",
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
    a: "La validité et les besoins de formation récurrente dépendent des fonctions exercées et des exigences applicables. Ces conditions doivent être vérifiées pour chaque parcours.",
  },
  {
    q: "Peut-on commencer sans expérience préalable en marchandises dangereuses ?",
    a: "Les prérequis et le parcours de formation dépendent des tâches exercées et du programme concerné. Le niveau requis est vérifié avant inscription.",
  },
  {
    q: "Quelle différence entre une formation matières dangereuses générale et la formation DGR IATA ?",
    a: "Une formation généraliste HSE ou ADR ne remplace pas les exigences propres au transport aérien. Le parcours DGR/CBTA doit correspondre aux tâches réellement exercées et aux règles applicables. La reconnaissance d'un certificat se vérifie séparément auprès de l'autorité ou de l'opérateur concerné.",
  },
  {
    q: "Vous déplacez-vous pour les formations intra-entreprise ?",
    a: "Oui, à partir de 6 participants nous nous déplaçons dans tous les pays d'Afrique francophone. La proposition précise le formateur, les supports et les modalités d'évaluation. Vous fournissez la salle et la logistique locale.",
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
