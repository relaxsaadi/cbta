import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "À propos de KOST GROUP — DGR / CBTA",
  description:
    "Présentation de KOST GROUP et de son approche DGR / CBTA : périmètre déterminé par les tâches, traçabilité des sources et revue qualifiée avant toute approbation de production.",
  alternates: { canonical: "/a-propos" },
  openGraph: {
    title: "À propos de KOST GROUP — DGR / CBTA",
    description:
      "Approche DGR / CBTA fondée sur les tâches, les sources applicables et une revue qualifiée fonction par fonction.",
    url: "/a-propos",
  },
};

export default function AProposPage() {
  return (
    <>
      <main className="bg-white">
        <section className="bg-gradient-to-br from-[#002A56] to-[#003D7A] text-white">
          <div className="container-x max-w-4xl py-16 md:py-20">
            <nav className="text-sm text-white/40 mb-6 flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span>/</span>
              <span className="text-white/70">À propos</span>
            </nav>
            <div className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-bold text-[#F39C12] mb-5">
              DGR / CBTA · périmètre validé fonction par fonction
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">À propos de KOST GROUP</h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
              KOST GROUP développe et organise des parcours de formation DGR / CBTA. Le périmètre applicable est déterminé à partir des tâches réelles, des sources courantes et du circuit de revue requis pour chaque fonction.
            </p>
          </div>
        </section>

        <section className="container-x max-w-4xl py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-6">Notre approche</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Les fonctions DGR / CBTA 7.1 à 7.10 sont traitées séparément. Nous n'utilisons pas la structure de la fonction 7.1 comme modèle automatique pour les autres fonctions et nous n'associons pas mécaniquement un intitulé de poste à une fonction.
            </p>
            <p>
              Les affirmations réglementaires doivent être rattachées à des preuves courantes faisant autorité. Lorsqu'une preuve manque ou se contredit, l'état reste explicitement ouvert et ne peut pas être présenté comme approuvé.
            </p>
            <p>
              La vérification des sources françaises et la revue bilingue anglaise sont des étapes distinctes lorsqu'elles sont requises. Un statut de production ne peut être attribué qu'après revue par une personne qualifiée identifiée et datée.
            </p>
          </div>
        </section>

        <section className="bg-[#f7f9fc]">
          <div className="container-x max-w-4xl py-12">
            <h2 className="text-2xl font-extrabold text-[#003D7A] mb-6">Ce que cette page ne revendique pas</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Aucune exclusivité nationale ou régionale n'est revendiquée sans preuve vérifiée.",
                "Aucune reconnaissance universelle par une autorité, une compagnie aérienne ou l'IATA n'est revendiquée sur cette page.",
                "Aucun taux de réussite, délai, prix ou validité réglementaire n'est présenté comme universel sans source actuelle applicable.",
                "Aucune fonction DGR n'est attribuée sur la seule base d'un titre de poste.",
              ].map((text) => (
                <div key={text} className="bg-white rounded-xl border border-gray-100 p-5 text-sm text-gray-700 leading-relaxed">
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-x max-w-4xl py-14">
          <h2 className="text-2xl font-extrabold text-[#003D7A] mb-4">Contact</h2>
          <p className="text-gray-700 mb-6">
            Pour déterminer un périmètre de formation, transmettez les tâches réellement exercées par les participants et le contexte opérationnel concerné.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center bg-[#003D7A] text-white font-bold px-5 py-2.5 rounded-full hover:bg-[#002A56] transition-colors text-sm">
              Formulaire de contact
            </Link>
            <Link href="/#formations" className="inline-flex items-center border border-[#003D7A] text-[#003D7A] font-bold px-5 py-2.5 rounded-full hover:bg-[#f7f9fc] transition-colors text-sm">
              Voir les parcours
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
