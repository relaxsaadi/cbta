import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page introuvable — KOST GROUP",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="fr">
      <body className="font-sans antialiased bg-[#002A56] text-white">
        <main className="container-x py-24 max-w-2xl">
          <h1 className="text-3xl font-extrabold mb-4">Page introuvable</h1>
          <p className="text-white/80 mb-8">
            Cette adresse n&apos;existe pas ou a été déplacée.
          </p>
          <ul className="space-y-2">
            <li><Link className="underline" href="/">Accueil</Link></li>
            <li><Link className="underline" href="/formation-dgr-algerie">Formation DGR Algérie</Link></li>
            <li><Link className="underline" href="/formation-dgr-alger">Formation DGR Alger</Link></li>
            <li><Link className="underline" href="/planning">Planning</Link></li>
            <li><Link className="underline" href="/contact">Contact</Link></li>
          </ul>
        </main>
      </body>
    </html>
  );
}
