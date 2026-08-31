"use client";

import Image from "next/image";
import { Award, CheckCircle, Globe } from "lucide-react";

const CREDS = [
  "Formé aux méthodes IATA Instructor & Evaluator",
  "15+ années dans le fret aérien international",
  "Ancien agent acceptation DGR — compagnie aérienne",
  "Formateur actif en Algérie · Maroc · Afrique francophone",
];

export default function TrainerBio() {
  return (
    <section className="section bg-[#f7f9fc]">
      <div className="container-x max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#F39C12] mb-2">
            Votre formateur
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A]">
            Une expertise IATA issue du terrain
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
          {/* Photo placeholder — remplacer src par /formateur.jpg quand disponible */}
          <div className="flex-shrink-0">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-[#003D7A] to-[#0a5a9c] flex items-center justify-center shadow-lg">
              <Award className="h-14 w-14 text-[#F39C12]" aria-hidden />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
              <h3 className="text-xl font-extrabold text-[#0f1c2e]">
                Formateur Principal IATA DGR CBTA
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F39C12]/15 border border-[#F39C12]/30 px-3 py-0.5 text-xs font-bold text-[#b87400]">
                <Award className="h-3 w-3" aria-hidden />
                KOST GROUP
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1 justify-center md:justify-start">
              <Globe className="h-3.5 w-3.5" aria-hidden />
              Alger, Algérie · Déplacements Afrique francophone
            </p>
            <p className="text-gray-700 leading-relaxed mb-6 max-w-xl">
              Praticien du fret aérien international, formé aux méthodes IATA Instructor & Evaluator et à la méthode CBTA. Sa formation académique en sécurité aéronautique et son expérience en acceptation cargo dangereux lui permettent de transmettre les réflexes opérationnels qui font réussir les apprenants dès le premier examen.
            </p>
            <ul className="space-y-2 text-sm text-left">
              {CREDS.map((c) => (
                <li key={c} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Note transparence E-E-A-T */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Pour en savoir plus sur le référentiel IATA CBTA, consultez le registre officiel sur{" "}
          <a
            href="https://www.iata.org/en/training/cbta-center-registry/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#003D7A]"
          >
            iata.org/cbta-center-registry
          </a>
        </p>
      </div>
    </section>
  );
}
