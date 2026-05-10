"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { trackLead, DEFAULT_LEAD_VALUE } from "@/lib/tracking";

export default function MerciTracker() {
  const params = useSearchParams();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const formation = params.get("f") || undefined;
    const pays = params.get("p") || undefined;
    const value = Number(params.get("v"));
    const tx = params.get("tx") || undefined;

    trackLead({
      formation,
      pays,
      leadValue: Number.isFinite(value) && value > 0 ? value : DEFAULT_LEAD_VALUE,
      transactionId: tx,
    });
  }, [params]);

  return null;
}
