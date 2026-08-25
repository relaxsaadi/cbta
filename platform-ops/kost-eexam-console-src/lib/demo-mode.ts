// Audit Presentation Mode — redaction utilities only. These functions NEVER
// invent or alter underlying data; they only control what is rendered to
// the screen when the mode is active. All counts, statuses, and evidence
// remain exactly as computed from real sources.
export const DEMO_MODE_COOKIE = "kost_demo_mode";

export function redactName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts.map((p) => (p[0] ? p[0].toUpperCase() + "." : "")).join(" ");
}

export function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "•••";
  return `${local[0] ?? "•"}${"•".repeat(Math.max(local.length - 1, 2))}@${domain}`;
}

export function redactUsername(username: string): string {
  if (username.length <= 2) return "••";
  return `${username.slice(0, 2)}${"•".repeat(username.length - 2)}`;
}

export function redactIp(ip: string): string {
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.•.•`;
  return "•••";
}
