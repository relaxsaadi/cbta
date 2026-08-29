"use client";

import { useState } from "react";
import { assignFunctionAction, removeFunctionAction } from "../actions";

interface UserFunctionRow {
  function_code: string;
  label: string;
}
interface FunctionOption {
  code: string;
  label: string;
}

/** "Gérer les fonctions DGR" (mission §26) — affecter/retirer, plusieurs
 * fonctions par candidat (déjà supporté par user_functions, clé composite).
 * Ne touche JAMAIS un examen déjà publié (table purement déclarative). */
export function FunctionsManager({ userId, current, allFunctions }: { userId: number; current: UserFunctionRow[]; allFunctions: FunctionOption[] }) {
  const [code, setCode] = useState("");
  const assignedCodes = new Set(current.map((f) => f.function_code));
  const available = allFunctions.filter((f) => !assignedCodes.has(f.code));

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12px] font-medium text-text-secondary">Fonctions DGR</p>
      {current.length === 0 ? (
        <p className="text-[12.5px] text-text-tertiary">Aucune fonction affectée.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {current.map((f) => (
            <span
              key={f.function_code}
              data-testid={`function-chip-${f.function_code}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface-base px-2.5 py-1 text-[11.5px] text-text-primary"
            >
              <span>{f.function_code}</span>
              <form action={removeFunctionAction.bind(null, userId, f.function_code)}>
                <button type="submit" title="Retirer" className="text-text-tertiary hover:text-status-critical-text">×</button>
              </form>
            </span>
          ))}
        </div>
      )}
      {available.length > 0 && (
        <form action={assignFunctionAction.bind(null, userId, code)} className="flex items-center gap-1.5">
          <select value={code} onChange={(e) => setCode(e.target.value)} className="rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]">
            <option value="">Choisir une fonction…</option>
            {available.map((f) => (
              <option key={f.code} value={f.code}>{f.code}</option>
            ))}
          </select>
          <button type="submit" disabled={!code} className="rounded-md border border-border-default px-2.5 py-1 text-[11.5px] font-medium text-text-secondary hover:border-border-strong disabled:opacity-60">
            Affecter
          </button>
        </form>
      )}
    </div>
  );
}
