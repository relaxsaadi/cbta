// Hachage de mot de passe — scrypt (node:crypto, natif, zéro dépendance
// externe). Pas de garde `import "server-only"` ici : utilisé aussi bien
// par les server actions Next.js que par scripts/seed-demo.ts (exécuté hors
// bundler Next via tsx) — voir la note dans lib/db.ts sur cette convention.
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1] as string, "hex");
  const expected = Buffer.from(parts[2] as string, "hex");
  const actual = scryptSync(password, salt, expected.length);
  // Comparaison à temps constant — évite une fuite d'information par
  // timing sur la longueur du préfixe correct du hash.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
