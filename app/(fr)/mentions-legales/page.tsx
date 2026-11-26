import type { Metadata } from "next";
import { MENTION_FR, ONLY_ANAC_FR, ONLY_IATA_FR, PROOF } from "@/lib/kost-facts";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de KOST GROUP",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <main className="bg-white">
        <div className="container-x py-16 max-w-3xl">
          <Link
            href="/"
            className="text-sm text-[#003D7A] hover:underline mb-6 inline-block"
          >
            ← Retour à l'accueil
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#003D7A] mb-8">
            Mentions légales
          </h1>
          <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">Éditeur du site</h2>
              <p>
                <strong>EURL KOST GROUPE</strong> (KOST Academy)
                <br />
                Cité Boushaki F n°176, Bab Ezzouar, 16024 Alger, Algérie
                <br />
                Téléphone : +213 542 30 53 83
                <br />
                Email : cbta@kostacademy.com
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">
                Entité de facturation
              </h2>
              <p>
                En Algérie, la facturation est assurée par <strong>EURL KOST GROUPE</strong>, en DA. Pour les clients hors Algérie, les paiements peuvent être traités par <strong>STRATEGIX</strong>, entité française partenaire de KOST GROUP.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">Hébergement</h2>
              <p>
                Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, USA
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">
                Agréments
              </h2>
              <p>
                KOST Academy est un {MENTION_FR}.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  {ONLY_IATA_FR.charAt(0).toUpperCase() + ONLY_IATA_FR.slice(1)} :{" "}
                  <a href={PROOF.iata} target="_blank" rel="noopener" className="text-[#003D7A] underline">
                    fiche EURL KOST GROUP au registre IATA
                  </a>
                </li>
                <li>
                  {ONLY_ANAC_FR.charAt(0).toUpperCase() + ONLY_ANAC_FR.slice(1)} :{" "}
                  <a href={PROOF.anacFr} target="_blank" rel="noopener" className="text-[#003D7A] underline">
                    liste ANAC des écoles de formation
                  </a>
                </li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">
                Propriété intellectuelle
              </h2>
              <p>
                L'ensemble du contenu de ce site (textes, images, logos, vidéos) est la propriété exclusive de KOST GROUP ou utilisé avec autorisation. Toute reproduction sans autorisation écrite préalable est interdite.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">Contact</h2>
              <p>
                Pour toute question relative au site ou aux formations, contactez-nous via le{" "}
                <Link href="/#formulaire" className="text-[#003D7A] underline">
                  formulaire
                </Link>{" "}
                ou par WhatsApp au +213 542 30 53 83.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
