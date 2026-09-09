export function buildMoodleRestRequest(
  baseUrl: string,
  token: string,
  wsfunction: string,
  params?: Record<string, string | number>,
): { url: string; body: URLSearchParams };
