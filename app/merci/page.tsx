import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, PhoneCall, FileText, Home, MessageCircle } from "lucide-react";
import { WHATSAPP_LINK, PHONE_DISPLAY } from "@/lib/formations";
import Footer from "@/components/Footer";
import MerciTracker from "./MerciTracker";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Merci pour votre demande",
  description:
    "Votre demande KOST GROUP a bien été reçue. Un conseiller vous contacte sous 24h ouvrables.",
  robots: { index: false, follow: false },
};

export default function MerciPage() {
  return (
    <>
      <Suspense fallback={null}>
        <MerciTracker />
      </Suspense>
      <main className="min-h-[80vh] bg-gradient-to-br from-[#003D7A] via-[#0a4a8a] to-[#002A56] flex items-center">
        <div className="container-x py-16 md:py-24">
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
              <CheckCircle2 className="h-12 w-12" aria-hidden />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#003D7A] mb-3">
              Merci ! Votre demande a bien été reçue
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              Un conseiller pédagogique KOST GROUP vous contacte très bientôt.
            </p>

            <div className="text-left bg-gray-50 rounded-2xl p-6 md:p-8 mb-8">
              <h2 className="text-lg font-bold text-[#0f1c2e] mb-5 text-center">
                Prochaines étapes
              </h2>
              <ol className="space-y-5">
                <li className="flex gap-4">
                  <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#003D7A] text-white font-bold">
                    1
                  </span>
                  <div>
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      <Mail className="h-4 w-4 text-[#F39C12]" aria-hidden />
                      Email reçu sous 5 minutes
                    </div>
                    <p className="text-sm text-gray-600">
                      Vérifiez votre boîte (et le dossier promotions/spam) — un email de confirmation arrive avec un récapitulatif.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#003D7A] text-white font-bold">
                    2
                  </span>
                  <div>
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      <PhoneCall className="h-4 w-4 text-[#F39C12]" aria-hidden />
                      Appel sous 24h ouvrables
                    </div>
                    <p className="text-sm text-gray-600">
                      Notre équipe pédagogique vous appelle pour qualifier votre besoin et préciser les dates de session.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#003D7A] text-white font-bold">
                    3
                  </span>
                  <div>
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      <FileText className="h-4 w-4 text-[#F39C12]" aria-hidden />
                      Devis personnalisé
                    </div>
                    <p className="text-sm text-gray-600">
                      Vous recevez un devis officiel en EUR ou USD adapté à votre fonction et au nombre de participants.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-[#F39C12]/10 border border-[#F39C12]/30 rounded-2xl p-5 mb-8">
              <p className="text-sm text-gray-700 mb-3">
                <strong>Besoin urgent ?</strong> Contactez-nous directement :
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <TrackedLink
                  track="whatsapp"
                  location="merci-page"
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp text-sm"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  WhatsApp
                </TrackedLink>
                <TrackedLink
                  track="phone"
                  href="tel:+213542305383"
                  className="btn-secondary text-sm"
                >
                  <PhoneCall className="h-5 w-5" aria-hidden />
                  {PHONE_DISPLAY}
                </TrackedLink>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#003D7A] font-semibold hover:underline"
            >
              <Home className="h-4 w-4" aria-hidden />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
