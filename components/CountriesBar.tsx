import { COUNTRIES } from "@/lib/formations";

export default function CountriesBar() {
  return (
    <section
      aria-label="Pays couverts"
      className="bg-white border-b border-gray-100 py-4"
    >
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm md:text-base text-gray-700">
          <span className="text-xs uppercase tracking-wider text-[#003D7A] font-bold mr-2">
            Pays couverts
          </span>
          {COUNTRIES.map((c, i) => (
            <span key={c.code} className="inline-flex items-center gap-1.5">
              <span aria-hidden className="text-lg">{c.flag}</span>
              <span className="font-medium">{c.name}</span>
              {i < COUNTRIES.length - 1 && (
                <span aria-hidden className="text-gray-300 ml-3">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
