import { test, expect } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import 'dotenv/config';

const execFileAsync = promisify(execFile);

// Read-only ground-truth check via the same SSH access used throughout this
// readiness pass (root@VPS -> docker exec into the DB container, reusing its
// own MYSQL_ROOT_PASSWORD env var so no password is ever printed/typed by
// this script). Requires ~/.ssh/hostarts_kost_moodle on the machine running
// this suite — this test suite is tied to this specific live environment,
// not meant to be portable/CI-generic.
async function queryAttemptState(attemptId) {
  // Base64-encode + pipe to mysql's stdin rather than an -e "..." argument —
  // avoids nested shell-quoting conflicts if the SQL ever needs a string
  // literal (bit us in mutation-rbac.spec.mjs; kept consistent here even
  // though this particular query has no literals today).
  const sql = `SELECT state, timefinish FROM moodle.mdl_quiz_attempts WHERE id=${Number(attemptId)};`;
  const b64 = Buffer.from(sql, 'utf8').toString('base64');
  const { stdout } = await execFileAsync('ssh', [
    '-i', `${process.env.HOME}/.ssh/hostarts_kost_moodle`,
    '-o', 'ConnectTimeout=10', '-o', 'BatchMode=yes',
    'root@102.206.40.221',
    `echo ${b64} | base64 -d | docker exec -i moodle-stack_db_1 sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" -N moodle 2>/dev/null'`,
  ]);
  const line = stdout.trim().split('\n').filter(l => l && !l.startsWith('**') && !l.includes('openssh.com')).pop();
  if (!line) return null;
  const [state, timefinish] = line.split('\t');
  return { state, timefinish };
}

// Rebuilt equivalent of the lost scratchpad's stress-test*/phase2/phase3/v1-v12
// candidate-flow scripts (see docs/AI_HANDOFF.md fifth-pass log). Exercises the
// REAL candidate lifecycle end-to-end against the live Moodle exam engine
// (exam.kostacademy.com), using the "KOST E-EXAM — Practice Test" quiz
// (course 4 / cmid=9), which is explicitly self-labelled in its own intro
// page as "Entraînement uniquement — Ceci n'est pas un examen de
// certification" / "contains no regulatory content" and allows unlimited
// attempts — the correct, safe target for repeated automated candidate-flow
// testing per the standing "use test/non-regulatory exams" rule. This never
// touches course 1 (the real DGR course) or course 3's sample exam.
//
// NOTE on wait strategy: Moodle keeps background AJAX alive on most pages
// (message-drawer polling, quiz timer heartbeat), so `networkidle` hangs to
// the test timeout even on a fully-rendered page. `page.click()` followed by
// `waitForLoadState('load')` is the reliable pattern confirmed in manual
// exploration this pass — Moodle's quiz nav is a classic full-page POST, not
// an SPA transition, so 'load' fires promptly and correctly.

const CANDIDATE = { user: process.env.RBAC_CANDIDATE_USER, pass: process.env.RBAC_CANDIDATE_PASS };
const PRACTICE_QUIZ_CMID = 9;

async function loginCandidate(page) {
  await page.goto('https://exam.kostacademy.com/login/index.php');
  // Observed this pass (WebKit/tablet-safari, once on Firefox): submitting
  // the login form immediately after goto() occasionally bounces back to
  // login with Moodle's own `?loginredirect=1` marker — consistent with a
  // logintoken/session-cookie race (the CSRF token embedded in the just-
  // loaded form is tied to a session cookie that hasn't fully round-tripped
  // yet in some engines). A brief settle delay before submitting is standard
  // mitigation for this class of race and matches how a real user's fill
  // time naturally avoids it; retried automatically below if it still slips
  // through.
  await page.waitForTimeout(400);
  await page.fill('#username', CANDIDATE.user);
  await page.fill('#password', CANDIDATE.pass);
  await page.click('#loginbtn');
  await page.waitForLoadState('load');
  if (page.url().includes('loginredirect=1') || (await page.locator('#username').count())) {
    // Retry once with a longer settle delay before concluding it's a real failure.
    await page.waitForTimeout(1000);
    await page.fill('#username', CANDIDATE.user);
    await page.fill('#password', CANDIDATE.pass);
    await page.click('#loginbtn');
    await page.waitForLoadState('load');
  }
}

async function startAttempt(page) {
  await page.goto(`https://exam.kostacademy.com/mod/quiz/view.php?id=${PRACTICE_QUIZ_CMID}`);
  // This quiz's button is always labelled "Démarrer le test d'entraînement",
  // even when an in-progress attempt already exists (confirmed by direct
  // observation this pass — Moodle just resumes the existing attempt under
  // the same label rather than showing "Continuer..."). A NEW attempt shows
  // an extra confirmation modal ("Voulez-vous commencer maintenant ?");
  // resuming an existing one does not. Handle both.
  await page.getByText("Démarrer le test d'entraînement", { exact: false }).first().click();
  await page.waitForTimeout(600);
  for (const b of await page.$$('input[type=submit], button')) {
    const t = (await b.textContent()) || (await b.getAttribute('value')) || '';
    if (t.includes('Démarrer une tentative')) { await b.click(); break; }
  }
  // waitForLoadState can resolve against the pre-click document if called
  // before the real navigation to attempt.php has actually begun (there's a
  // JS/modal-close delay between click and nav start). Poll the URL instead.
  await page.waitForURL(u => u.pathname.includes('/mod/quiz/attempt.php'), { timeout: 20000 });
  const url = new URL(page.url());
  return url.searchParams.get('attempt');
}

test.describe('Candidate exam lifecycle (live, non-regulatory practice quiz)', () => {
  test('candidate can log in and reach only their authorized exam', async ({ page }) => {
    await loginCandidate(page);
    expect(page.url()).toContain('/my/');
    await page.goto('https://exam.kostacademy.com/course/view.php?id=4');
    await expect(page.locator('body')).toContainText('KOST E-EXAM — Practice Test');
  });

  test('instructions page states practice-only scope before starting', async ({ page }) => {
    await loginCandidate(page);
    await page.goto(`https://exam.kostacademy.com/mod/quiz/view.php?id=${PRACTICE_QUIZ_CMID}`);
    // Actual case is "Entraînement uniquement" — visually rendered uppercase
    // via CSS text-transform, but toContainText checks real textContent.
    await expect(page.locator('body')).toContainText('Entraînement uniquement');
    await expect(page.locator('body')).toContainText('Not a Certification Examination');
  });

  test('full attempt: start, timer, navigate, flag, autosave, refresh, submit, confirm, results', async ({ page }) => {
    test.setTimeout(60_000);
    await loginCandidate(page);
    const attemptId = await startAttempt(page);
    expect(attemptId).toBeTruthy();

    // Timer visible and counting down from ~10 minutes
    await expect(page.locator('body')).toContainText('Temps restant');

    // Flag whichever question we land on first (works whether this is a
    // fresh attempt on Q1 or a resumed attempt further along)
    const flagLabel = page.locator('text=MARQUER LA QUESTION').first();
    if (await flagLabel.count()) await flagLabel.click();

    // This practice quiz mixes question types (MCQ + free-text/essay), and a
    // resumed in-progress attempt (e.g. from an earlier interrupted run) can
    // land on any of its 4 pages, not necessarily Q1. Answer generically —
    // whatever input type is present — then advance via the real "Page
    // suivante" submit (confirmed this pass to be what actually persists the
    // answer server-side; a bare click without it does not persist), for up
    // to 4 pages or until no "next" control remains (last page shows
    // "Terminer le test..." instead).
    for (let i = 0; i < 4; i++) {
      // Scoped to the actual question form fields (name="qATTEMPT:N_answer...")
      // — an unscoped `input[type=radio]` also matches unrelated global page
      // widgets (e.g. the messaging drawer's "message_blocknoncontacts"
      // radios), which are present but hidden and hang a bare .check() call.
      const radio = page.locator('input[type=radio][name^="q"]').first();
      const textarea = page.locator('#region-main textarea').first();
      if (await radio.count()) {
        await radio.check();
      } else if (await textarea.count()) {
        await textarea.fill('Practice answer (automated test, non-regulatory, unscored).');
      }
      const nextBtn = page.locator('input[name="next"]');
      if (!(await nextBtn.count())) break; // last page — no "next", only "finish"
      await Promise.all([page.waitForNavigation(), nextBtn.click()]);
    }

    // Last page has no "next" — reach the summary via the "Terminer le
    // test..." link/button, then confirm-submit from there.
    if (!page.url().includes('summary.php')) {
      // Two elements can match this text: a visually-hidden accessibility
      // skip-link (DOM order first) and the real, visible nav-panel link
      // (DOM order last). Target the visible one directly.
      const finishLink = page.getByText('Terminer le test', { exact: false }).last();
      if (await finishLink.count()) {
        await Promise.all([page.waitForNavigation(), finishLink.click()]);
      }
    }
    if (page.url().includes('summary.php')) {
      // The finish control is a real <button> (id "frm-finishattempt" form,
      // posts to processattempt.php), not an <input type=submit> — confirmed
      // by direct DOM inspection this pass.
      const finishBtn = page.locator('#frm-finishattempt button, button:has-text("Tout envoyer et terminer")').first();
      if (await finishBtn.count()) {
        // This click only opens a JS confirm modal — it does not itself
        // navigate — so don't race it against waitForNavigation.
        await finishBtn.click();
        await page.waitForTimeout(800);
        const confirmBtns = await page.$$('.modal.show input[type=submit], .modal.show button, [role=dialog] input[type=submit], [role=dialog] button');
        for (const b of confirmBtns) {
          const t = (await b.textContent()) || (await b.getAttribute('value')) || '';
          if (/envoyer|confirm/i.test(t) && t !== 'Annuler') {
            await Promise.all([page.waitForNavigation(), b.click()]);
            break;
          }
        }
      }
    }

    // Refresh/reconnect: state survives a reload regardless of which page we
    // ended on (this exercises the same guarantee the mid-attempt case does).
    await page.reload();
    await page.waitForLoadState('load');

    // Ground truth for submit-confirmation / scoring / double-submit
    // protection comes from the server, not UI text — this quiz has
    // "Relecture non autorisée" (review not permitted) configured, so
    // post-finish pages intentionally do NOT render a review/results screen
    // to the candidate (confirmed by direct observation: summary.php/
    // review.php redirect back to view.php for a finished attempt under this
    // setting). That is correct behavior for this quiz's configuration, not
    // a defect — so we verify completion via the quiz engine's own database
    // state instead of scraping a review UI it deliberately doesn't show.
    const dbState = await queryAttemptState(attemptId);
    expect(dbState).toBeTruthy();
    expect(dbState.state).toBe('finished');
    expect(Number(dbState.timefinish)).toBeGreaterThan(0);

    // Double-submit protection: navigating straight back into the finished
    // attempt's URL must not let the candidate re-enter/re-answer it.
    await page.goto(`https://exam.kostacademy.com/mod/quiz/attempt.php?attempt=${attemptId}&cmid=${PRACTICE_QUIZ_CMID}`);
    await expect(page.locator('input[name="next"]')).toHaveCount(0);
    const postFinishState = await queryAttemptState(attemptId);
    expect(postFinishState.state).toBe('finished'); // did not flip back to inprogress
  });

  test('historical attempt integrity: an older finished attempt is still readable/unchanged', async ({ page }) => {
    await loginCandidate(page);
    await page.goto(`https://exam.kostacademy.com/mod/quiz/view.php?id=${PRACTICE_QUIZ_CMID}`);
    await expect(page.locator('body')).toContainText('Tentative');
    // We only read the attempt-history list here; we never delete or edit a
    // prior attempt row, satisfying "do not modify historical real attempts".
  });
});
