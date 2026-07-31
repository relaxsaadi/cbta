"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "kost_urgence_banner_dismissed";

export default function UrgenceBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (SSR safety)
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="w-full bg-[#7c2d12] text-white text-sm"
      style={{ minHeight: "40px" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* Desktop text */}
        <p className="hidden sm:block leading-snug flex-1">
          <span className="font-semibold">⚠️ Alerte ANAC 2026 :</span>{" "}
          Seuls les centres IATA CBTA sont désormais reconnus — votre certification est-elle toujours valide ?{" "}
          <a
            href="https://wa.me/213542305383"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold whitespace-nowrap hover:text-orange-200 transition-colors"
          >
            → Vérifier maintenant
          </a>
        </p>

        {/* Mobile text (shorter) */}
        <p className="block sm:hidden leading-snug flex-1 text-xs">
          <span className="font-semibold">⚠️ ANAC 2026 :</span>{" "}
          Centres non-CBTA non reconnus.{" "}
          <a
            href="https://wa.me/213542305383"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold hover:text-orange-200 transition-colors"
          >
            Vérifier →
          </a>
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
