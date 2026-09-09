import "server-only";
import { buildMoodleRestRequest } from "./moodle-request.mjs";

const WS_SERVICE = process.env.MOODLE_WS_SERVICE ?? "kost_eexam_console";

// Lues à l'appel, pas à l'import — sinon `next build` échoue en collectant
// les pages (les variables runtime ne sont injectées qu'au démarrage du
// conteneur via docker-compose env_file, pas disponibles au build).
function getMoodleBaseUrl(): string {
  const url = process.env.MOODLE_INTERNAL_URL;
  if (!url) {
    throw new Error("MOODLE_INTERNAL_URL manquant — appel Moodle impossible côté serveur.");
  }
  return url;
}

export class MoodleAuthError extends Error {}
export class MoodleApiError extends Error {}

/**
 * Authentifie un utilisateur Moodle via le flux standard login/token.php
 * (le même que l'app mobile officielle Moodle). Ne fonctionne PAS pour un
 * compte Site Administrator Moodle — restriction native, pas un bug.
 */
export async function loginToMoodle(username: string, password: string): Promise<string> {
  const res = await fetch(`${getMoodleBaseUrl()}/login/token.php`, {
    method: "POST",
    body: new URLSearchParams({ username, password, service: WS_SERVICE }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new MoodleAuthError(`Moodle a répondu ${res.status}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new MoodleAuthError(data.error as string);
  }
  return data.token as string;
}

/**
 * Appelle une fonction Web Service Moodle avec un token donné (celui de
 * l'utilisateur connecté, ou celui du compte de service technique pour les
 * requêtes d'agrégation qui ne dépendent pas d'un utilisateur précis).
 *
 * Le token et les paramètres sont envoyés en POST application/x-www-form-urlencoded,
 * jamais dans l'URI. Moodle REST accepte les paramètres GET/POST ; garder les
 * secrets hors de l'URL évite leur capture accidentelle par les access logs,
 * traces proxy/APM et historiques de requêtes.
 */
export async function callMoodleWs<T = unknown>(
  token: string,
  wsfunction: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const { url, body } = buildMoodleRestRequest(getMoodleBaseUrl(), token, wsfunction, params);

  const res = await fetch(url, {
    method: "POST",
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new MoodleApiError(`Moodle WS a répondu ${res.status} pour ${wsfunction}`);
  }
  const data = await res.json();
  if (data && typeof data === "object" && "exception" in data) {
    throw new MoodleApiError(`${data.errorcode}: ${data.message}`);
  }
  return data as T;
}

/** Requêtes d'agrégation backend (compte technique, pas un utilisateur) */
export async function callMoodleServiceWs<T = unknown>(
  wsfunction: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const serviceToken = process.env.MOODLE_SERVICE_TOKEN;
  if (!serviceToken) {
    throw new MoodleApiError("MOODLE_SERVICE_TOKEN manquant.");
  }
  return callMoodleWs<T>(serviceToken, wsfunction, params);
}

export interface MoodleSiteInfo {
  userid: number;
  username: string;
  fullname: string;
  sitename: string;
}

export async function getSiteInfo(token: string): Promise<MoodleSiteInfo> {
  return callMoodleWs<MoodleSiteInfo>(token, "core_webservice_get_site_info");
}
