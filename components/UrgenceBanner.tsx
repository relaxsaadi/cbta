"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const STORAGE_KEY = "kost_urgence_banner_dismissed";

// Pages ciblant un autre pays que l'Algérie : le Décret 21-253 et l'ANAC
// sont spécifiques à l'Algérie, donc ce bandeau n'y est pas pertinent.
const NON_ALGERIA_PATHS = [
  "/formation-dgr-maroc",
  "/formation-dgr-senegal",
  "/formation-dgr-cote-ivoire",
  "/formation-dgr-cameroun",
  "/formation-dgr-afrique",
];

export default function UrgenceBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const hiddenOnThisPage = NON_ALGERIA_PATHS.includes(pathname);

  useEffect(() => {
    if (hiddenOnThisPage) return;
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (SSR safety)
      setVisible(true);
    }
  }, [hiddenOnThisPage]);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (hiddenOnThisPage || !visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-[#7c2d12] text-white text-sm"
      style={{ minHeight: "40px" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <p className="leading-snug flex-1">
          <span className="font-semibold">Cadre réglementaire Algérie :</span>{" "}
          vérifiez le périmètre applicable et les exigences de formation DGR à partir des textes et sources en vigueur avant de conclure à une obligation ou à une équivalence.{" "}
          <Link
            href="/reglementation-dgr-algerie"
            className="underline font-semibold hover:text-orange-200 transition-colors"
          >
            Voir les références →
          </Link>
        </p>

        <button
          onClick={dismiss}
          aria-label="Fermer le bandeau"
          className="shrink-0 ml-2 text-white/70 hover:text-white transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
