import type { Metadata } from "next";
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
                <strong>KOST GROUP</strong>
                <br />
                176 Cité Boushaki, Bab Ezzouar
                <br />
                Alger, Algérie
                <br />
                Téléphone : +213 542 30 53 83
                <br />
                Email : kostgroupe@gmail.com
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">
                Entité de facturation
              </h2>
              <p>
                Les paiements et la facturation officielle EUR/USD sont assurés par <strong>STRATEGIX</strong>, entité française partenaire de KOST GROUP.
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
                Certification IATA
              </h2>
              <p>
                KOST GROUP est officiellement certifié <strong>CBTA Provider</strong> par l'International Air Transport Association (IATA). La vérification est disponible publiquement sur{" "}
                <a
                  href="https://www.iata.org/en/training/cbta-center-registry/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#003D7A] underline"
                >
                  iata.org/cbta-center-registry
                </a>
                .
              </p>
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
