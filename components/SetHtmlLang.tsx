"use client";

import { useEffect } from "react";

/** The root layout is lang=fr. English exact-match pages switch the document language. */
export default function SetHtmlLang({ lang }: { lang: "fr" | "en" }) {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.lang;
    root.lang = lang;
    return () => {
      root.lang = previous;
    };
  }, [lang]);

  return null;
}
