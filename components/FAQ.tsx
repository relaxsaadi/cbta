"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "Comment vérifier le périmètre et l'acceptation d'une formation ?",
    a: "L'acceptation dépend du programme suivi, des tâches réellement exercées, des règles de l'État et des exigences de l'exploitant concerné. Vérifiez le statut et le périmètre du prestataire dans les registres officiels, puis confirmez l'acceptation du document délivré auprès de l'autorité ou de l'exploitant concerné. Un référencement CBTA ne vaut pas approbation ANAC ni reconnaissance automatique par toutes les compagnies aériennes.",
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
    q: "Comment déterminer l'échéance de formation récurrente ?",
    a: "La périodicité dépend des exigences applicables à la fonction et aux tâches, des règles de l'État et de l'exploitant, ainsi que de l'édition réglementaire en vigueur. Ne présumez pas d'une durée universelle : vérifiez l'échéance applicable avant de planifier le récurrent.",
  },
  {
    q: "Peut-on commencer sans expérience préalable en marchandises dangereuses ?",
    a: "Les prérequis et le parcours initial dépendent des tâches confiées et du programme applicable. Le périmètre doit être établi à partir des activités réelles, puis confirmé avec l'employeur et, lorsque nécessaire, l'exploitant ou l'autorité compétente.",
  },
  {
    q: "Quelle différence entre une formation matières dangereuses générale et la formation DGR IATA ?",
    a: "Les formations HSE ou ADR et les formations relatives au transport aérien répondent à des cadres différents. Pour le fret aérien, les compétences à couvrir se déterminent selon les tâches réellement exercées et les exigences actuelles de l'État et de l'exploitant. Un intitulé de poste ou le seul fait de travailler dans le fret ne suffit pas à attribuer automatiquement une fonction CBTA.",
  },
  {
    q: "Vous déplacez-vous pour les formations intra-entreprise ?",
    a: "Les modalités intra-entreprise, le lieu, les supports et les modalités d'évaluation sont définis dans le programme et le devis. Le statut de l'évaluation et les documents éventuellement délivrés sont précisés avant toute inscription.",
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
