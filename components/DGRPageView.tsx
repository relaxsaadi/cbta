"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/tracking";

export default function DGRPageView({ formation }: { formation: string }) {
  useEffect(() => {
    trackPageView({ formation });
  }, [formation]);
  return null;
}
