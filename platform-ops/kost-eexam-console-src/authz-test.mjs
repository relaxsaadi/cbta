import { chromium } from "playwright";

const BASE = "https://console.kostacademy.com";
const browser = await chromium.launch();

async function attemptLogin(username, password) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  const url = page.url();
  const errorText = await page.locator("p.rounded-md").first().textContent().catch(() => null);
  await context.close();
  return { url, loggedIn: url.includes("/overview"), errorText };
}

console.log("=== 1. Administrator (console_admin) — attendu: autorisé ===");
console.log(await attemptLogin("console_admin", "Kcdf0583b303968ff7ee42!A1"));

console.log("\n=== 2. Candidat Moodle normal (test_candidate) — attendu: REFUSÉ ===");
console.log(await attemptLogin("test_candidate", "CandidateTest123!Aa"));

console.log("\n=== 3. Identifiants invalides — attendu: REFUSÉ ===");
console.log(await attemptLogin("nonexistent_user", "wrongpassword123"));

console.log("\n=== 4. Utilisateur non authentifié accède à /overview directement ===");
const ctx4 = await browser.newContext();
const page4 = await ctx4.newPage();
await page4.goto(`${BASE}/overview`, { waitUntil: "networkidle" });
console.log({ url: page4.url(), redirectedToLogin: page4.url().endsWith("/login") });
await ctx4.close();

await browser.close();
