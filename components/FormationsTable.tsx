"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, User } from "lucide-react";
import { FORMATIONS } from "@/lib/formations";
import { trackPricingCta } from "@/lib/tracking";

export default function FormationsTable() {
  const [mode, setMode] = useState<"particulier" | "entreprise">("particulier");
  const isEntreprise = mode === "entreprise";

  return (
    <section className="section bg-gray-50" id="formations">
      <div className="container-x">
        <div className="text-center mb-8">
          <span className="inline-block text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-2">
            Catalogue complet
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f1c2e] mb-3">
            Les 12 formations IATA DGR-CBTA
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Toutes les fonctions de la 7.1 à la 7.10, en initial et en recurrent. Choisissez la formation correspondant à votre fonction.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setMode("particulier")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !isEntreprise
                  ? "bg-[#003D7A] text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className="h-4 w-4" aria-hidden />
              Particulier / Individuel
            </button>
            <button
              onClick={() => setMode("entreprise")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isEntreprise
                  ? "bg-[#003D7A] text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Building2 className="h-4 w-4" aria-hidden />
              Entreprise / Institution
            </button>
          </div>

          {isEntreprise && (
            <p className="mt-3 text-sm text-gray-500">
              Tarifs groupe, formations intra-entreprise et devis sur mesure — réponse sous 24h.
            </p>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#003D7A] text-white">
              <tr>
                <th className="text-left p-4 font-semibold">Fonction</th>
                <th className="text-left p-4 font-semibold">Public</th>
                <th className="text-left p-4 font-semibold">Durée</th>
                {!isEntreprise && (
                  <>
                    <th className="text-right p-4 font-semibold">Prix EUR</th>
                    <th className="text-right p-4 font-semibold">Prix USD</th>
                  </>
                )}
                {isEntreprise && (
                  <th className="text-right p-4 font-semibold">Tarif</th>
                )}
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
                  {!isEntreprise && (
                    <>
                      <td className="p-4 text-right font-bold text-[#0f1c2e]">
                        {f.prixEur.toLocaleString("fr-FR")} €
                      </td>
                      <td className="p-4 text-right text-gray-600">
                        {f.prixUsd.toLocaleString("fr-FR")} $
                      </td>
                    </>
                  )}
                  {isEntreprise && (
                    <td className="p-4 text-right">
                      <span className="inline-block text-xs font-semibold text-[#003D7A] bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">
                        Sur devis
                      </span>
                    </td>
                  )}
                  <td className="p-4 text-center">
                    <a
                      href="#contact"
                      onClick={() => trackPricingCta(f.code)}
                      className="inline-flex items-center gap-1 text-[#F39C12] hover:text-[#d6860a] font-semibold whitespace-nowrap"
                    >
                      {isEntreprise ? "Devis" : "Détails"}{" "}
                      <ArrowRight className="h-4 w-4" aria-hidden />
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
                  {!isEntreprise ? (
                    <>
                      <div className="font-bold text-[#0f1c2e]">
                        {f.prixEur.toLocaleString("fr-FR")} €
                      </div>
                      <div className="text-xs text-gray-500">
                        {f.prixUsd.toLocaleString("fr-FR")} $
                      </div>
                    </>
                  ) : (
                    <span className="inline-block text-xs font-semibold text-[#003D7A] bg-blue-50 px-2 py-1 rounded-full">
                      Sur devis
                    </span>
                  )}
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
                  href="#contact"
                  onClick={() => trackPricingCta(f.code)}
                  className="flex-1 text-center text-sm py-2 px-3 rounded-lg bg-[#F39C12] text-[#0f1c2e] font-bold"
                >
                  {isEntreprise ? "Demander devis" : "S'inscrire"}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
