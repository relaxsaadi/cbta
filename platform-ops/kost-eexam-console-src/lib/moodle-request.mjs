/**
 * Build one Moodle REST request without placing credentials or business
 * parameters in the URI. Moodle's REST server accepts ordinary POST form
 * parameters, so the Web Service token does not need to appear in a query
 * string where reverse proxies, access logs or APM traces may retain it.
 *
 * Kept in a small runtime-neutral module so the transport invariant can be
 * regression-tested without importing Next.js' `server-only` guard.
 *
 * @param {string} baseUrl
 * @param {string} token
 * @param {string} wsfunction
 * @param {Record<string, string | number>} [params]
 * @returns {{ url: string, body: URLSearchParams }}
 */
export function buildMoodleRestRequest(baseUrl, token, wsfunction, params = {}) {
  if (!baseUrl) throw new Error("Moodle base URL is required");
  if (!token) throw new Error("Moodle Web Service token is required");
  if (!wsfunction) throw new Error("Moodle Web Service function is required");

  const url = `${baseUrl.replace(/\/+$/, "")}/webservice/rest/server.php`;
  const body = new URLSearchParams({
    wstoken: token,
    wsfunction,
    moodlewsrestformat: "json",
  });

  for (const [key, value] of Object.entries(params)) {
    body.set(key, String(value));
  }

  return { url, body };
}
