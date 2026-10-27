"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "Est-ce reconnu dans mon pays (Maroc, Sénégal, Tunisie, Côte d'Ivoire) ?",
    a: "La reconnaissance d'une attestation ou d'une formation DGR/CBTA dépend du parcours suivi, de l'organisme émetteur et des exigences de l'autorité, du transporteur ou de l'employeur concerné. Demandez les justificatifs actuels du programme proposé avant inscription. Aucune reconnaissance universelle n'est présumée.",
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
    a: "La périodicité de formation et les modalités de maintien de compétence dépendent des tâches exercées, du programme suivi et des exigences applicables. Confirmez toute durée de validité auprès de l'émetteur du document concerné.",
  },
  {
    q: "Peut-on commencer sans expérience préalable en marchandises dangereuses ?",
    a: "Une formation initiale peut être envisagée selon les tâches exercées, le niveau de départ et les prérequis du programme. La fonction CBTA appropriée et les modalités d'évaluation se définissent après une analyse des tâches, sans promesse automatique de niveau expert.",
  },
  {
    q: "Quelle différence entre une formation matières dangereuses générale et la formation DGR IATA ?",
    a: "Les formations généralistes en matières dangereuses (HSE, stockage, transport routier) et les parcours DGR pour le transport aérien ne couvrent pas nécessairement les mêmes tâches ni les mêmes règles. Pour le fret aérien, les fonctions et exigences applicables se déterminent à partir des activités réellement exercées. Aucune exclusivité ou reconnaissance universelle de certificat n'est présumée.",
  },
  {
    q: "Vous déplacez-vous pour les formations intra-entreprise ?",
    a: "Les formations intra-entreprise sont étudiées selon les tâches, le nombre de participants, le pays, les sources applicables et les disponibilités. Les modalités d'évaluation et tout document éventuellement délivré sont précisés dans la proposition validée.",
  },
  {
    q: "Quels sont les délais d'inscription ?",
    a: "Les dates et délais d'inscription sont précisés dans le calendrier ou devis à jour. Les disponibilités et éventuelles sessions spécifiques doivent être confirmées avant engagement.",
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
