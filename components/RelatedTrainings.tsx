import Link from "next/link";
import { relatedPages } from "@/lib/site-pages";

/** "Formations liées" block — server-rendered internal links from the registry. */
export default function RelatedTrainings({ path, lang = "fr" }: { path: string; lang?: "fr" | "en" }) {
  const items = relatedPages(path, 8);
  if (items.length === 0) return null;
  const en = lang === "en";
  return (
    <nav aria-label={en ? "Related training" : "Formations liées"} className="bg-white border-t border-gray-100">
      <div className="container-x max-w-5xl py-10">
        <h2 className="text-xl md:text-2xl font-extrabold text-[#003D7A] mb-5">
          {en ? "Related training" : "Formations liées"}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path || "/"}
                hrefLang={item.lang}
                className="block h-full rounded-xl border border-gray-200 bg-[#f7f9fc] px-4 py-3 font-semibold text-[#003087] no-underline hover:border-[#003087]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
