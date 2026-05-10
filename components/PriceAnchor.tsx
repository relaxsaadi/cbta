import { TrendingDown } from "lucide-react";

export default function PriceAnchor() {
  return (
    <section className="section bg-white">
      <div className="container-x">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#003D7A] to-[#002A56] p-8 md:p-12 text-white shadow-2xl">
          <div className="flex items-center justify-center gap-2 text-[#F39C12] text-sm font-bold uppercase tracking-wider mb-6">
            <TrendingDown className="h-5 w-5" aria-hidden />
            Économie réelle
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-right border-b md:border-b-0 md:border-r border-white/20 pb-6 md:pb-0 md:pr-8">
              <div className="text-sm uppercase tracking-wider text-white/60 mb-2">
                À Bruxelles
              </div>
              <div className="text-4xl md:text-5xl font-extrabold line-through opacity-70">
                ~3 500 €
              </div>
              <div className="text-sm text-white/60 mt-2">+ déplacement et hébergement</div>
            </div>
            <div className="text-center md:text-left md:pl-8">
              <div className="text-sm uppercase tracking-wider text-[#F39C12] mb-2">
                Chez KOST en Afrique
              </div>
              <div className="text-5xl md:text-6xl font-extrabold text-[#F39C12]">
                1 800 €
              </div>
              <div className="text-sm text-white/80 mt-2">Tout inclus</div>
            </div>
          </div>
          <div className="text-center mt-8 pt-8 border-t border-white/20">
            <p className="text-lg md:text-xl font-semibold">
              Même certificat IATA · <span className="text-[#F39C12]">Économie de 1 700 €</span> · Sans le déplacement
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
