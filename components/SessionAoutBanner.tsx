import Link from "next/link";

export default function SessionAoutBanner() {
  return (
    <div className="bg-[#F39C12] text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="text-lg" aria-hidden="true">🗓</span>
          <div>
            <span className="font-bold text-sm sm:text-base">
              Prochaine session : 18&nbsp;–&nbsp;22 Août 2026
            </span>
            <span className="hidden sm:inline text-white/80 mx-2">·</span>
            <span className="block sm:inline text-xs sm:text-sm text-white/90 font-medium">
              12 places restantes · Early bird −50 EUR/pers avant le 15 août
            </span>
          </div>
        </div>
        <Link
          href="/session-aout"
          className="shrink-0 inline-flex items-center gap-1.5 bg-[#003D7A] hover:bg-[#002d5a] text-white text-sm font-bold px-4 py-2 rounded-full transition-colors shadow-sm whitespace-nowrap"
        >
          Voir les dates &amp; tarifs →
        </Link>
      </div>
    </div>
  );
}
