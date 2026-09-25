import Link from "next/link";
import { CalendarDays, MessageCircle, ShieldCheck } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/formations";

export default function PlanningPage() {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Bonjour, je souhaite vérifier le planning en vigueur et déterminer la fonction DGR/CBTA adaptée aux tâches du participant."
  )}`;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
            <CalendarDays aria-hidden="true" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            Planning des formations DGR/CBTA
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
            Le calendrier détaillé, les tarifs, les durées et les places disponibles doivent être confirmés sur l’offre en vigueur avant inscription. Cette page ne publie plus d’anciennes dates de campagne ni de fausse urgence réglementaire.
          </p>

          <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5 text-sm leading-6 text-amber-100">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
              <p>
                La fonction CBTA pertinente n’est pas attribuée uniquement à partir d’un titre de poste ou d’un secteur. Elle doit être déterminée à partir des tâches réellement exercées et de la table de tâches CBTA applicable. Les Functions 7.1 à 7.10 restent donc à qualifier individuellement.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Vérifier le planning et le besoin
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Demander une offre confirmée
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
