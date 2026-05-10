"use client";

import { useEffect, useState } from "react";

export type UTMParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
};

const KEYS: (keyof UTMParams)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
];

const STORAGE_KEY = "kost_utm_v1";
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

type StoredUTM = { params: UTMParams; ts: number };

function readFromStorage(): UTMParams | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUTM;
    if (!parsed?.ts || Date.now() - parsed.ts > TTL_MS) return null;
    return parsed.params;
  } catch {
    return null;
  }
}

function writeToStorage(params: UTMParams): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredUTM = { params, ts: Date.now() };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / privacy mode — ignore */
  }
}

function readFromUrl(search: string): UTMParams {
  const out: UTMParams = {};
  const params = new URLSearchParams(search);
  for (const k of KEYS) {
    const v = params.get(k);
    if (v) out[k] = v.slice(0, 200);
  }
  return out;
}

export function useUTMParams(): UTMParams {
  const [utm, setUtm] = useState<UTMParams>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fromUrl = readFromUrl(window.location.search);
    const hasFromUrl = Object.keys(fromUrl).length > 0;

    if (hasFromUrl) {
      writeToStorage(fromUrl);
      setUtm(fromUrl);
      return;
    }

    const fromStorage = readFromStorage();
    if (fromStorage) setUtm(fromStorage);
  }, []);

  return utm;
}

export function serializeUTM(utm: UTMParams): string {
  const out = Object.entries(utm)
    .filter(([, v]) => Boolean(v))
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
    .join("&");
  return out;
}
