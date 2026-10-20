import { FileSearch } from "lucide-react";

export default function PriceAnchor() {
  return (
    <section className="section bg-white">
      <div className="container-x">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#003D7A] to-[#002A56] p-8 md:p-12 text-white shadow-2xl">
          <div className="flex items-center justify-center gap-2 text-[#F39C12] text-sm font-bold uppercase tracking-wider mb-6">
            <FileSearch className="h-5 w-5" aria-hidden />
            Devis après cadrage
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-5">
            Prix et durée confirmés après validation du périmètre
          </h2>
          <p className="text-white/80 leading-relaxed text-center max-w-2xl mx-auto">
            Aucun prix, économie comparative, durée ou contenu « tout inclus » n'est présenté par défaut sans source commerciale courante. Le devis doit correspondre à la fonction réellement requise, au nombre de participants, aux modalités d'organisation et aux éléments inclus effectivement confirmés.
          </p>
        </div>
      </div>
    </section>
  );
}
