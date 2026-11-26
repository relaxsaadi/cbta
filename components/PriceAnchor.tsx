import Link from "next/link";
import { Tag } from "lucide-react";
import { FORMATIONS, getFormationHref } from "@/lib/formations";
import { formatDa } from "@/lib/kost-facts";

/** Public DA price grid — one price per course, identical everywhere. */
export default function PriceAnchor() {
  return (
    <section id="tarifs" className="section bg-white">
      <div className="container-x">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#003D7A] to-[#002A56] p-6 md:p-12 text-white shadow-2xl">
          <div className="flex items-center justify-center gap-2 text-[#F39C12] text-sm font-bold uppercase tracking-wider mb-4">
            <Tag className="h-5 w-5" aria-hidden />
            Tarifs en DA
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-6">
            Prix par participant, fonctions 7.1 à 7.10
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm md:text-base">
              <thead>
                <tr className="border-b border-white/20 text-white/70">
                  <th className="py-2 pr-3 font-semibold">Formation</th>
                  <th className="py-2 pr-3 font-semibold">Durée</th>
                  <th className="py-2 font-semibold text-right">Prix HT</th>
                </tr>
              </thead>
              <tbody>
                {FORMATIONS.map((f) => (
                  <tr key={f.slug} className="border-b border-white/10">
                    <td className="py-2 pr-3">
                      <Link href={getFormationHref(f.slug)} className="font-semibold text-white hover:underline">
                        {f.code}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-white/80">{f.duree}</td>
                    <td className="py-2 text-right font-bold whitespace-nowrap">{formatDa(f.prixDa)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-white/75 text-sm leading-relaxed text-center mt-5">
            Prix hors taxes, TVA formation de 9 % en sus. Facturation par EURL KOST GROUPE, en DA.
            La fonction retenue et le prix final sont confirmés dans la proposition écrite.
          </p>
        </div>
      </div>
    </section>
  );
}
