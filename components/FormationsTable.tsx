"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FORMATIONS } from "@/lib/formations";
import { trackPricingCta } from "@/lib/tracking";

export default function FormationsTable() {
  return (
    <section className="section bg-gray-50" id="formations">
      <div className="container-x">
        <div className="text-center mb-12">
          <span className="inline-block text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-2">
            Catalogue complet
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f1c2e] mb-3">
            Les 13 formations IATA DGR-CBTA
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Toutes les fonctions de la 7.1 à la 7.10, en initial et en recurrent. Choisissez la formation correspondant à votre fonction.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#003D7A] text-white">
              <tr>
                <th className="text-left p-4 font-semibold">Fonction</th>
                <th className="text-left p-4 font-semibold">Public</th>
                <th className="text-left p-4 font-semibold">Durée</th>
                <th className="text-right p-4 font-semibold">Prix EUR</th>
                <th className="text-right p-4 font-semibold">Prix USD</th>
                <th className="text-center p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {FORMATIONS.map((f, i) => (
                <tr
                  key={f.slug}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-4">
                    <div className="font-bold text-[#003D7A]">{f.code}</div>
                    <div className="text-gray-600 text-xs mt-0.5">
                      {f.title}
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">{f.publicCible}</td>
                  <td className="p-4 text-gray-700 whitespace-nowrap">
                    {f.duree}
                  </td>
                  <td className="p-4 text-right font-bold text-[#0f1c2e]">
                    {f.prixEur.toLocaleString("fr-FR")} €
                  </td>
                  <td className="p-4 text-right text-gray-600">
                    {f.prixUsd.toLocaleString("fr-FR")} $
                  </td>
                  <td className="p-4 text-center">
                    <a
                      href={`#formulaire?formation=${encodeURIComponent(f.code)}`}
                      onClick={() => trackPricingCta(f.code)}
                      className="inline-flex items-center gap-1 text-[#F39C12] hover:text-[#d6860a] font-semibold whitespace-nowrap"
                    >
                      Détails <ArrowRight className="h-4 w-4" aria-hidden />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {FORMATIONS.map((f) => (
            <div key={f.slug} className="card">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="font-bold text-[#003D7A] text-lg">
                    {f.code}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">{f.title}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-[#0f1c2e]">
                    {f.prixEur.toLocaleString("fr-FR")} €
                  </div>
                  <div className="text-xs text-gray-500">
                    {f.prixUsd.toLocaleString("fr-FR")} $
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                <span className="font-medium">Public :</span> {f.publicCible} ·{" "}
                <span className="font-medium">{f.duree}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/${f.slug}`}
                  className="flex-1 text-center text-sm py-2 px-3 rounded-lg border border-[#003D7A] text-[#003D7A] font-semibold"
                >
                  Voir détails
                </Link>
                <a
                  href={`#formulaire?formation=${encodeURIComponent(f.code)}`}
                  onClick={() => trackPricingCta(f.code)}
                  className="flex-1 text-center text-sm py-2 px-3 rounded-lg bg-[#F39C12] text-[#0f1c2e] font-bold"
                >
                  S'inscrire
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
