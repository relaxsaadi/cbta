import { ShieldCheck } from "lucide-react";

export default function Guarantee() {
  return (
    <section className="section bg-white">
      <div className="container-x">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#F39C12]/10 to-white border-2 border-[#F39C12]/30 p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F39C12] text-white mb-6 shadow-lg">
            <ShieldCheck className="h-10 w-10" aria-hidden />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f1c2e] mb-4">
            Engagement de transparence
          </h2>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Les conditions de rattrapage, d'examen, de certification ou de remboursement ne sont pas supposées. Elles doivent être indiquées explicitement dans l'offre applicable et correspondre aux modalités réellement disponibles.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Aucun taux de réussite n'est publié ici sans données vérifiées et méthode de calcul documentée.
          </p>
        </div>
      </div>
    </section>
  );
}
