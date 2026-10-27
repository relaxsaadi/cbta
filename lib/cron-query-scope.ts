/**
 * Compatibility allowlist while migrating legacy server crons away from URL
 * query credentials. This function does not authorize dashboards or arbitrary
 * API requests; each allowlisted handler must verify its token independently.
 */
const LEGACY_CRON_GET_PATHS = new Set([
  '/api/agents/africa-scan',
  '/api/agents/followup',
  '/api/agents/linkedin-outreach',
  '/api/agents/send-email',
  '/api/prospects/scan',
]);

export function canBypassBasicForLegacyCron(
  method: string,
  pathname: string,
  suppliedSecret: string | null,
  configuredSecret: string | undefined,
  browserExposedSecret: string | undefined
): boolean {
  // A NEXT_PUBLIC_ value is eligible for inclusion in browser bundles.
  // If it aliases the privileged server cron credential, query-token
  // compatibility MUST NOT grant a second authentication factor.
  const browserAlias =
    typeof browserExposedSecret === 'string'
    && browserExposedSecret.length > 0
    && browserExposedSecret === configuredSecret;
  return !browserAlias
    && method === 'GET'
    && LEGACY_CRON_GET_PATHS.has(pathname)
    && typeof configuredSecret === 'string'
    && configuredSecret.length > 0
    && suppliedSecret === configuredSecret;
}
