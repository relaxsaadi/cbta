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

for (let retry = 0; retry < 4; retry++) {
  await page.goto(`${BASE}/mod/quiz/view.php?id=9`, { waitUntil: "networkidle" }); // cmid=9 = Practice Test
  await page.waitForTimeout(800);
  const continueBtn = page.locator('button:has-text("Continuer"), a:has-text("Continuer")').first();
  if (await continueBtn.count() > 0) {
    console.log(`Retry ${retry}: cache lock error page, clicking Continuer and retrying...`);
    await continueBtn.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    continue;
  }
  break;
}
console.log("Quiz view URL:", page.url());
await page.waitForTimeout(1000);
await page.screenshot({ path: "/tmp/practice-view.png", fullPage: true });
const mainText = await page.locator("#region-main, [role='main'], main").first().textContent().catch(() => null);
console.log("MAIN REGION TEXT:", mainText?.slice(0, 1500));

const attemptBtn = page.locator(
  'button:has-text("Effectuer de nouveau le test"), input[value*="Effectuer de nouveau le test"], a:has-text("Effectuer de nouveau le test"), ' +
  'button:has-text("Effectuer le test"), input[value*="Effectuer le test"], a:has-text("Effectuer le test"), ' +
  'button:has-text("Attempt quiz now"), input[value="Attempt quiz now"], a:has-text("Attempt quiz now"), ' +
  'button:has-text("Re-attempt"), a:has-text("Re-attempt"), ' +
  '.quizattempt button, .quizattempt input[type="submit"], .quizattempt a.btn'
).first();
if (await attemptBtn.count() === 0) {
  console.log("No attempt button found via selectors.");
  await browser.close();
  process.exit(1);
}
await attemptBtn.click();
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/practice-after-click.png", fullPage: true });
// Confirmation modal: "Démarrer une tentative" / "Start attempt".
const startNowBtn = page.getByRole("button", { name: /Démarrer une tentative|Start attempt|Effectuer de nouveau le test|Re-attempt/ }).first();
if (await startNowBtn.count() > 0) {
  await startNowBtn.click({ force: true });
  await page.waitForURL(/attempt\.php/, { timeout: 10000 }).catch(() => {});
  await page.waitForLoadState("networkidle");
}
await page.waitForTimeout(1000);
console.log("Attempt started, URL:", page.url());

// Answer each of the 4 questions honestly (real interaction: MCQ, MCQ,
// True/False, then a real free-text answer for the essay/open-answer
// question), then move to next page.
for (let i = 0; i < 4; i++) {
  await page.waitForLoadState("networkidle");
  const radios = page.locator('#region-main input[type="radio"], form.questionflagsaveform input[type="radio"], .que input[type="radio"]');
  const count = await radios.count();
  if (count > 0) {
    await radios.first().check({ force: true });
  } else {
    const textarea = page.locator('#region-main textarea, .que textarea').first();
    if (await textarea.count() > 0) {
      await textarea.fill("I would raise my hand and wait for the invigilator's authorization before leaving my seat, as described in the exam procedure.");
      console.log(`Q${i + 1}: answered essay/open-answer question with real free text`);
    } else {
      console.log(`Q${i + 1}: no radio/textarea inputs found in question region`);
    }
  }
  await page.screenshot({ path: `/tmp/practice-q${i + 1}.png`, fullPage: true });
  const nextBtn = page.locator(
    'input[value="Page suivante"], button:has-text("Page suivante"), ' +
    'input[value*="Terminer le test"], button:has-text("Terminer le test"), ' +
    'input[value="Next page"], button:has-text("Next page")'
  ).first();
  if (await nextBtn.count() === 0) break;
  await nextBtn.click();
  await page.waitForLoadState("networkidle");
}

console.log("After navigating questions, URL:", page.url());
await page.screenshot({ path: "/tmp/practice-summary.png", fullPage: true });

const submitBtn = page.getByRole("button", { name: /Tout envoyer et terminer|Submit all and finish/ }).first();
if (await submitBtn.count() > 0) {
  await submitBtn.click({ force: true });
  await page.waitForTimeout(800);
  // Confirmation modal has its own "Tout envoyer et terminer" button.
  const confirmBtn = page.locator('[role="dialog"] button, .modal.show button').filter({ hasText: /Tout envoyer et terminer|Submit all and finish/ }).first();
  if (await confirmBtn.count() > 0) {
    await confirmBtn.click({ force: true });
    await page.waitForLoadState("networkidle");
  }
}
console.log("Final URL:", page.url());
await page.screenshot({ path: "/tmp/practice-final.png", fullPage: true });

await browser.close();
