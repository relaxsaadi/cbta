"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "Comment savoir quelle fonction DGR 7.1 à 7.10 s'applique ?",
    a: "La fonction ne doit pas être déduite du seul intitulé du poste. Elle est déterminée à partir des tâches réellement exercées et de la table de tâches / du jeu de sources courant propre à la fonction concernée.",
  },
  {
    q: "Le certificat ou la formation est-il automatiquement reconnu dans tous les pays ?",
    a: "Non. Cette page ne revendique aucune reconnaissance universelle. La reconnaissance dépend notamment de la voie de délivrance, de l'autorité ou de l'opérateur concerné et des exigences applicables au moment considéré. Ces points doivent être vérifiés avant inscription.",
  },
  {
    q: "Combien de temps une qualification ou un certificat reste-t-il valable ?",
    a: "Aucune durée universelle n'est affirmée ici. La durée ou l'échéance applicable doit être vérifiée dans la source courante qui régit le parcours, l'opérateur et la situation concernés.",
  },
  {
    q: "Comment les affirmations réglementaires sont-elles vérifiées ?",
    a: "Une affirmation destinée à la production doit être rattachée à une preuve courante faisant autorité. Si la preuve manque, l'état reste SOURCE GAP. Si des sources se contredisent, l'état reste SOURCE CONFLICT jusqu'à résolution.",
  },
  {
    q: "La fonction 7.1 sert-elle de modèle pour toutes les autres fonctions ?",
    a: "Non. Chaque fonction 7.1 à 7.10 doit être dérivée de sa propre table de tâches et de son propre jeu de sources. Le nombre de sous-tâches ou la structure de 7.1 ne doit pas être copié mécaniquement.",
  },
  {
    q: "Comment fonctionne la revue française et anglaise ?",
    a: "La vérification des sources françaises et la revue technique bilingue anglaise sont des étapes distinctes lorsqu'elles sont requises. Un simple miroir ou une traduction ne remplace pas une revue bilingue réelle.",
  },
  {
    q: "Quand un contenu peut-il être marqué APPROVED ?",
    a: "Seulement lorsque le circuit de preuve et de revue requis est complet, avec un reviewer qualifié identifié et une date de revue. Un état SOURCE GAP ou SOURCE CONFLICT ne peut pas être promu en APPROVED.",
  },
  {
    q: "Peut-on organiser une formation pour une entreprise ?",
    a: "Oui, les modalités peuvent être étudiées après analyse du nombre de participants, des tâches, du contexte opérationnel, de la langue et du périmètre DGR à examiner. Les dates, durées et conditions commerciales sont confirmées dans la proposition à jour.",
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
              Comprendre le périmètre DGR / CBTA
            </h2>
          </div>
          <div className="space-y-3">
            {ITEMS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-[#0f1c2e]">{item.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#003D7A] transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  {isOpen && (
                    <div id={`faq-${i}`} className="px-5 pb-5 text-gray-600 leading-relaxed">
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
