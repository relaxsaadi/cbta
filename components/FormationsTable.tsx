"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FORMATIONS } from "@/lib/formations";
import { trackPricingCta } from "@/lib/tracking";

export default function FormationsTable() {
  return (
    <section className="section bg-gray-50" id="formations">
      <div className="container-x">
        <div className="text-center mb-8">
          <span className="inline-block text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-2">
            Fonctions DGR / CBTA
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f1c2e] mb-3">
            Parcours 7.1 à 7.10 — périmètre à confirmer
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chaque fonction est traitée depuis sa propre table de tâches et son propre jeu de sources. Aucun public, poste, prix, durée ou prérequis n'est déduit automatiquement d'une ancienne grille ou de la structure de la fonction 7.1.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FORMATIONS.map((f) => (
            <div key={f.slug} className="card flex flex-col">
              <div className="font-bold text-[#003D7A] text-lg mb-1">{f.code}</div>
              <div className="text-gray-700 font-semibold mb-3">{f.title}</div>
              <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-4">
                Périmètre déterminé après analyse des tâches, vérification des sources applicables et revue requise. Les modalités commerciales sont confirmées dans une proposition à jour.
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/${f.slug}`}
                  className="flex-1 text-center text-sm py-2 px-3 rounded-lg border border-[#003D7A] text-[#003D7A] font-semibold"
                >
                  Voir le cadrage
                </Link>
                <a
                  href="#contact"
                  onClick={() => trackPricingCta(f.code)}
                  className="inline-flex items-center justify-center gap-1 text-sm py-2 px-3 rounded-lg bg-[#F39C12] text-[#0f1c2e] font-bold"
                >
                  Demander <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
