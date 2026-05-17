"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Send } from "lucide-react";
import { FORMATIONS, COUNTRIES } from "@/lib/formations";
import { leadSchema } from "@/lib/schemas";
import { useUTMParams } from "@/lib/useUTMParams";
import {
  trackFormStart,
  trackFormSubmitAttempt,
  trackFormSubmitError,
} from "@/lib/tracking";

type Props = {
  defaultFormation?: string;
  sourcePage?: string;
};

async function hashTransactionId(email: string): Promise<string> {
  const input = `${email}::${Date.now()}`;
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(input)
      );
      return Array.from(new Uint8Array(buf))
        .slice(0, 12)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    /* fall through */
  }
  return `tx_${Date.now().toString(36)}`;
}

export default function LeadForm({ defaultFormation, sourcePage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utm = useUTMParams();
  const formStartedRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const formationFromQuery = searchParams.get("formation") ?? undefined;
  const initialFormation =
    formationFromQuery || defaultFormation || FORMATIONS[0].code;

  const [formation, setFormation] = useState(initialFormation);

  useEffect(() => {
    if (formationFromQuery) setFormation(formationFromQuery);
  }, [formationFromQuery]);

  const handleFirstFocus = () => {
    if (!formStartedRef.current) {
      formStartedRef.current = true;
      trackFormStart();
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const fd = new FormData(e.currentTarget);

    const payload = {
      prenom: String(fd.get("prenom") || "").trim(),
      nom: String(fd.get("nom") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      whatsapp: String(fd.get("whatsapp") || "").trim(),
      pays: String(fd.get("pays") || "").trim(),
      entreprise: String(fd.get("entreprise") || "").trim(),
      formation: String(fd.get("formation") || "").trim(),
      message: String(fd.get("message") || "").trim(),
      consent: fd.get("consent") === "on",
      website: String(fd.get("website") || ""), // honeypot
      sourcePage:
        sourcePage ||
        (typeof window !== "undefined" ? window.location.pathname : ""),
      utm_source: utm.utm_source || "",
      utm_medium: utm.utm_medium || "",
      utm_campaign: utm.utm_campaign || "",
      utm_term: utm.utm_term || "",
      utm_content: utm.utm_content || "",
      gclid: utm.gclid || "",
      fbclid: utm.fbclid || "",
    };

    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0]?.toString();
        if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      trackFormSubmitError("validation");
      return;
    }

    trackFormSubmitAttempt();
    setSubmitting(true);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error || "Une erreur est survenue. Réessayez ou contactez-nous via WhatsApp.";
        setServerError(msg);
        trackFormSubmitError(`http_${res.status}`);
        setSubmitting(false);
        return;
      }
      // Pass selected formation + price + transaction_id for conversion tracking
      const fObj = FORMATIONS.find((x) => x.code === parsed.data.formation);
      const txId = await hashTransactionId(parsed.data.email);
      const params = new URLSearchParams({
        f: parsed.data.formation,
        p: parsed.data.pays,
        tx: txId,
      });
      if (fObj) params.set("v", String(fObj.prixEur));
      router.push(`/merci?${params.toString()}`);
    } catch {
      setServerError("Connexion impossible. Vérifiez votre réseau.");
      trackFormSubmitError("network");
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base focus:border-[#003D7A] focus:outline-none transition-colors";
  const errorCls = "border-red-400 focus:border-red-500";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <section
      id="formulaire"
      className="section bg-gradient-to-br from-[#003D7A] via-[#0a4a8a] to-[#002A56]"
    >
      <div className="container-x">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 text-white">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              Recevez le programme détaillé et un rappel sous 24h
            </h2>
            <p className="text-white/85 text-lg">
              Un conseiller pédagogique vous contacte sous 24 heures ouvrables.
            </p>
          </div>
          <form
            onSubmit={onSubmit}
            onFocus={handleFirstFocus}
            noValidate
            className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl"
          >
            {/* Honeypot */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: "-9999px",
                width: 1,
                height: 1,
                overflow: "hidden",
              }}
            >
              <label>
                Ne pas remplir
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="prenom" className={labelCls}>
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  required
                  autoComplete="given-name"
                  className={`${inputCls} ${errors.prenom ? errorCls : ""}`}
                />
                {errors.prenom && (
                  <p className="text-xs text-red-600 mt-1">{errors.prenom}</p>
                )}
              </div>
              <div>
                <label htmlFor="nom" className={labelCls}>
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  autoComplete="family-name"
                  className={`${inputCls} ${errors.nom ? errorCls : ""}`}
                />
                {errors.nom && (
                  <p className="text-xs text-red-600 mt-1">{errors.nom}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className={labelCls}>
                Email professionnel <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={`${inputCls} ${errors.email ? errorCls : ""}`}
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="whatsapp" className={labelCls}>
                  WhatsApp (avec indicatif) <span className="text-red-500">*</span>
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  required
                  placeholder="+212 6 XX XX XX XX"
                  autoComplete="tel"
                  className={`${inputCls} ${errors.whatsapp ? errorCls : ""}`}
                />
                {errors.whatsapp && (
                  <p className="text-xs text-red-600 mt-1">{errors.whatsapp}</p>
                )}
              </div>
              <div>
                <label htmlFor="pays" className={labelCls}>
                  Pays de résidence <span className="text-red-500">*</span>
                </label>
                <select
                  id="pays"
                  name="pays"
                  required
                  defaultValue=""
                  className={`${inputCls} ${errors.pays ? errorCls : ""}`}
                >
                  <option value="" disabled>Sélectionnez votre pays</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                  <option value="Autre">Autre pays</option>
                </select>
                {errors.pays && (
                  <p className="text-xs text-red-600 mt-1">{errors.pays}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="entreprise" className={labelCls}>
                Entreprise / organisation
              </label>
              <input
                id="entreprise"
                name="entreprise"
                type="text"
                autoComplete="organization"
                className={inputCls}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="formation" className={labelCls}>
                Formation souhaitée <span className="text-red-500">*</span>
              </label>
              <select
                id="formation"
                name="formation"
                required
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
                className={`${inputCls} ${errors.formation ? errorCls : ""}`}
              >
                {FORMATIONS.map((f) => (
                  <option key={f.slug} value={f.code}>
                    {f.code} — {f.title} ({f.prixEur.toLocaleString("fr-FR")} €)
                  </option>
                ))}
              </select>
              {errors.formation && (
                <p className="text-xs text-red-600 mt-1">{errors.formation}</p>
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="message" className={labelCls}>
                Message / besoins spécifiques
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                placeholder="Nombre de participants, dates souhaitées, intra-entreprise..."
                className={inputCls}
              />
            </div>

            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-[#003D7A] focus:ring-[#003D7A] shrink-0"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  J'accepte d'être contacté par KOST GROUP au sujet de cette demande et reconnais avoir lu la{" "}
                  <a
                    href="/confidentialite"
                    className="text-[#003D7A] underline font-medium"
                  >
                    politique de confidentialité
                  </a>
                  . <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.consent && (
                <p className="text-xs text-red-600 mt-1">{errors.consent}</p>
              )}
            </div>

            {serverError && (
              <div
                role="alert"
                className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700"
              >
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" aria-hidden />
                  Recevoir le programme
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-4">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Vos données sont confidentielles — RGPD
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
