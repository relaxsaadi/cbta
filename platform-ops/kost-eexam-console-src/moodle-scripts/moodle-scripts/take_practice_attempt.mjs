import { chromium } from "playwright";

const BASE = "https://exam.kostacademy.com";
const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(`${BASE}/login/index.php`, { waitUntil: "networkidle" });
await page.fill('#username', "test_candidate");
await page.fill('#password', "CandidateTest123!Aa");
await page.click('#loginbtn');
await page.waitForLoadState("networkidle");
console.log("Logged in as test_candidate, URL:", page.url());

await page.goto(`${BASE}/mod/quiz/view.php?id=9`, { waitUntil: "networkidle" }); // cmid=9 = Practice Test
console.log("Quiz view URL:", page.url());
await page.screenshot({ path: "/tmp/practice-view.png", fullPage: true });

const attemptBtn = page.locator('button:has-text("Attempt quiz now"), input[value="Attempt quiz now"], a:has-text("Attempt quiz now")').first();
if (await attemptBtn.count() === 0) {
  console.log("No attempt button found — dumping body text");
  console.log((await page.locator("body").textContent())?.slice(0, 1000));
  await browser.close();
  process.exit(1);
}
await attemptBtn.click();
await page.waitForLoadState("networkidle");
console.log("Attempt started, URL:", page.url());

// Answer each of the 3 questions honestly (real interaction), then move to next page.
for (let i = 0; i < 3; i++) {
  await page.waitForLoadState("networkidle");
  // MCQ: pick the first radio option available; True/False: pick "True".
  const radios = page.locator('input[type="radio"]');
  const count = await radios.count();
  if (count > 0) {
    await radios.first().check();
  }
  await page.screenshot({ path: `/tmp/practice-q${i + 1}.png`, fullPage: true });
  const nextBtn = page.locator('input[value="Next page"], input[value="Finish attempt ..."], button:has-text("Next page"), button:has-text("Finish attempt")').first();
  if (await nextBtn.count() === 0) break;
  await nextBtn.click();
  await page.waitForLoadState("networkidle");
}

console.log("After navigating questions, URL:", page.url());
await page.screenshot({ path: "/tmp/practice-summary.png", fullPage: true });

const submitBtn = page.locator('input[value="Submit all and finish"], button:has-text("Submit all and finish")').first();
if (await submitBtn.count() > 0) {
  await submitBtn.click();
  await page.waitForLoadState("networkidle");
  const confirmBtn = page.locator('button:has-text("Submit all and finish"), input[value="Submit all and finish"]').first();
  if (await confirmBtn.count() > 0) {
    await confirmBtn.click();
    await page.waitForLoadState("networkidle");
  }
}
console.log("Final URL:", page.url());
await page.screenshot({ path: "/tmp/practice-final.png", fullPage: true });

await browser.close();
