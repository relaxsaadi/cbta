import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et traitement RGPD — KOST GROUP",
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
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
            Politique de confidentialité
          </h1>
          <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">
                Données collectées
              </h2>
              <p>
                Lorsque vous remplissez notre formulaire de contact, nous collectons : prénom, nom, email professionnel, numéro WhatsApp, pays de résidence, entreprise (optionnel), formation souhaitée, message éventuel.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">Finalité</h2>
              <p>
                Ces données sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>vous transmettre le programme de formation demandé,</li>
                <li>vous contacter pour qualifier votre besoin,</li>
                <li>établir un devis personnalisé,</li>
                <li>assurer le suivi pédagogique et administratif.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">
                Base légale
              </h2>
              <p>
                Le traitement repose sur votre consentement explicite (case à cocher du formulaire) et sur l'exécution de mesures précontractuelles à votre demande (article 6.1.a et 6.1.b RGPD).
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">
                Durée de conservation
              </h2>
              <p>
                Vos données sont conservées pendant <strong>3 ans</strong> à compter du dernier contact. Après cette durée, elles sont supprimées ou anonymisées.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">
                Destinataires
              </h2>
              <p>
                Vos données sont accessibles uniquement à l'équipe pédagogique et commerciale de KOST GROUP, ainsi qu'à STRATEGIX (entité française) pour la facturation. Aucune donnée n'est revendue à des tiers.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">
                Sous-traitants techniques
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Vercel (hébergement)</li>
                <li>Resend (envoi d'emails transactionnels)</li>
                <li>Google (analytics, ads)</li>
                <li>LinkedIn / Meta (mesure publicitaire si activée)</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">Vos droits</h2>
              <p>
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité, de limitation et d'opposition. Pour exercer ces droits, contactez-nous à{" "}
                <a href="mailto:kostgroupe@gmail.com" className="text-[#003D7A] underline">
                  kostgroupe@gmail.com
                </a>
                .
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#0f1c2e] mb-2">Cookies</h2>
              <p>
                Le site utilise des cookies techniques (fonctionnement) et de mesure d'audience (Google Tag Manager, analytics, publicité). Vous pouvez configurer votre navigateur pour les refuser.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
