"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackLead } from "@/lib/tracking";

export default function MerciTracker() {
  const params = useSearchParams();

  useEffect(() => {
    const formation = params.get("f") || undefined;
    const pays = params.get("p") || undefined;
    const value = Number(params.get("v")) || undefined;
    trackLead({
      email: "",
      formation,
      pays,
      prixEur: value,
    });
  }, [params]);

  return null;
}
