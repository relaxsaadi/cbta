import { chromium } from "playwright";

const BASE = "https://console.kostacademy.com";
const results = [];

function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// 1. Middleware redirects unauthenticated users to /login
const res1 = await page.goto(`${BASE}/overview`, { waitUntil: "networkidle" });
check("Unauthenticated /overview redirects to /login", page.url().endsWith("/login"), page.url());

// 2. Login page renders correctly
const title = await page.title();
check("Login page title correct", title === "Sign in — KOST E-EXAM", title);
await page.screenshot({ path: "screenshots/prod-01-login.png" });

// 3. Wrong credentials are rejected
await page.fill('input[name="username"]', "wrong_user");
await page.fill('input[name="password"]', "wrong_password_123");
await page.click('button[type="submit"]');
await page.waitForTimeout(1500);
const errorVisible = await page.locator("text=Invalid credentials").isVisible().catch(() => false);
check("Wrong credentials rejected with error message", errorVisible);

// 4. Real Moodle login succeeds (real non-admin account, real Moodle backend)
await page.fill('input[name="username"]', "console_admin");
await page.fill('input[name="password"]', "Kcdf0583b303968ff7ee42!A1");
await page.click('button[type="submit"]');
try {
  await page.waitForURL("**/overview", { timeout: 15000 });
  check("Real Moodle login succeeds, redirects to /overview", true);
} catch {
  check("Real Moodle login succeeds, redirects to /overview", false, `stuck at ${page.url()}`);
}
await page.waitForLoadState("networkidle");
await page.screenshot({ path: "screenshots/prod-02-overview.png", fullPage: true });

// 5. Session persists across navigation (cookie works)
await page.goto(`${BASE}/system`, { waitUntil: "networkidle" });
check("Session persists on /system (no redirect to login)", page.url().endsWith("/system"));
await page.screenshot({ path: "screenshots/prod-03-system.png", fullPage: true });

// 6. Real user name appears (proves Moodle identity flowed through, not fake)
const welcomeText = await page.goto(`${BASE}/overview`, { waitUntil: "networkidle" }).then(() =>
  page.locator("h1").first().textContent()
);
check("Real Moodle full name displayed", welcomeText?.includes("Console Administrator") ?? false, welcomeText ?? "");
await page.screenshot({ path: "screenshots/prod-04-overview-final.png", fullPage: true });

// 7. Phase 2 placeholder honest state
await page.goto(`${BASE}/exams`, { waitUntil: "networkidle" });
const noFakeData = await page.locator("text=Coming in Phase 2").isVisible().catch(() => false);
check("Phase 2 placeholder shows honest state, no fake data", noFakeData);
await page.screenshot({ path: "screenshots/prod-05-exams-placeholder.png", fullPage: true });

// 8. Logout works
await page.locator('button[type="submit"]:has-text("Log out")').click();
await page.waitForURL("**/login", { timeout: 10000 }).catch(() => {});
check("Logout redirects to /login", page.url().endsWith("/login"), page.url());

// 9. Session actually destroyed (protected route no longer accessible)
await page.goto(`${BASE}/overview`, { waitUntil: "networkidle" });
check("Session destroyed — /overview redirects to /login after logout", page.url().endsWith("/login"), page.url());

await browser.close();

console.log("\n=== SMOKE TEST SUMMARY ===");
const failed = results.filter((r) => !r.ok);
console.log(`${results.length - failed.length}/${results.length} passed`);
if (failed.length > 0) {
  console.log("FAILED:", failed.map((f) => f.name).join(", "));
  process.exit(1);
}
