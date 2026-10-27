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
  configuredSecret: string | undefined
): boolean {
  return method === 'GET'
    && LEGACY_CRON_GET_PATHS.has(pathname)
    && typeof configuredSecret === 'string'
    && configuredSecret.length > 0
    && suppliedSecret === configuredSecret;
}
