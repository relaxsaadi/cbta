#!/usr/bin/env node
/**
 * Public-repository tripwire for known DGR examination-content artifact paths and keyed Markdown sections.
 *
 * IMPORTANT: this is a narrow file-path merge check, not a secret scanner,
 * retroactive content withdrawal, push-time protection, or proof that all
 * assessment material is confidential. See GitHub issue #340.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

// A valid function number must not be followed by another digit. This also
// blocks filename-copy suffixes such as "-backup", "_copy", or " (copy)".
const restrictedArtifact = /(?:^|\/)DGR_(?:PRODUCTION_BANK|EN_REVIEW_PACKAGE)_7\.(?:10|[1-9])(?![0-9])/i;

function isRestricted(path) {
  return restrictedArtifact.test(path.replaceAll("\\", "/"));
}

// A renamed Markdown question bank can evade a filename-only detector.
// Detect only high-confidence keyed item sections; this is a tripwire, not a
// guarantee that every answer-key style or exported format is recognized.
// Never print source excerpts, correct answers, or rationales to CI logs.
const questionHeading = /^\s{0,3}#{1,6}\s+Q-7\.(?:10|[1-9])-\d{3}(?!\d)(?:\s|$)/gmi;
const structuredTextExtensions = /\.(?:csv|tsv|json|jsonl|ndjson)$/i;
const moodleXmlExtension = /\.xml$/i;
const giftExtension = /\.(?:gift|txt)$/i;
const candidateTextExtensions = /\.(?:md|markdown|txt|csv|tsv|json|jsonl|ndjson|xml|gift)$/i;
const MAX_TEXT_BYTES = 16 * 1024 * 1024;

// Structured exports may conceal keyed DGR items even when renamed.
// Require a function-specific item ID, a question-text field AND an answer-key
// field. A provenance ledger with only Correct_Answer_Recoverable must not trip.
const dgrQuestionId = /(?:^|[^A-Za-z0-9])Q-7\.(?:10|[1-9])-\d{3}(?!\d)/i;
const questionField = /(?:^|[,{\t\r\n])["']?(?:question(?:[_-]?(?:text|fr|en))?|stem(?:[_-]?(?:fr|en))?|prompt|item[_-]?text|text[_-]?(?:fr|en))["']?\s*(?:[:,]|$)/im;
const answerField = /(?:^|[,{\t\r\n])["']?(?:correct[_-]?answer|correct[_-]?option|correct[_-]?choice|answer[_-]?key|answer)["']?\s*(?:[:,]|$)/im;

function containsStructuredDgrAnswerKey(text) {
  return dgrQuestionId.test(text) && questionField.test(text) && answerField.test(text);
}

// Moodle XML "cloze" questions store correct answers within questiontext
// (often CDATA), not necessarily <answer fraction="..."> elements.
// Scope both ID and key to one cloze question; this is a narrow tripwire,
// not a complete XML parser or a confidentiality guarantee.
function containsKeyedDgrClozeXml(text) {
  const questions = text.matchAll(/<question\b[^>]*\btype\s*=\s*["']cloze["'][^>]*>([\s\S]*?)<\/question\s*>/gi);
  for (const [, question] of questions) {
    if (!dgrQuestionId.test(question)) continue;
    const texts = question.matchAll(/<questiontext\b[^>]*>([\s\S]*?)<\/questiontext\s*>/gi);
    for (const [, questionText] of texts) {
      const embedded = questionText.matchAll(
        /\{\s*(?:\d+(?:\.\d+)?)?\s*:\s*(?:SHORTANSWER(?:_C)?|MULTICHOICE(?:_[VH])?|NUMERICAL|SA|SAC|MC|MCV|MCH|NM|MW|MWC)\s*:\s*([^{}]*)\}/gi
      );
      for (const [, choices] of embedded) {
        if (/(?:^|~)\s*=\s*\S/.test(choices)) return true;
        // Moodle also permits positive partial-credit answers without '='.
        const fractions = choices.matchAll(
          /(?:^|~)\s*%\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*%\s*(?=\S)/gi
        );
        if ([...fractions].some(([, fraction]) => Number(fraction) > 0)) return true;
      }
    }
  }
  return false;
}

// Recognize high-confidence Moodle XML exports with a DGR item ID and a
// positively keyed <answer> or embedded cloze answer. Filename may vary.
function containsMoodleXmlDgrAnswerKey(text) {
  if (containsKeyedDgrClozeXml(text)) return true;
  // Scope the DGR item identity, Moodle question type and answer fraction
  // to the SAME <question>. A non-DGR keyed question elsewhere in a mixed
  // export must not make an unkeyed DGR question appear confidentially keyed.
  const questions = text.matchAll(/<question\b([^>]*)>([\s\S]*?)<\/question\s*>/gi);
  for (const [, attrs, question] of questions) {
    if (!/\btype\s*=\s*["'](?:multichoice|truefalse|shortanswer|matching|numerical|calculated)["']/i.test(attrs)
      || !dgrQuestionId.test(question)) continue;
    const hasPositiveAnswer = [...question.matchAll(
      /<answer\b[^>]*\bfraction\s*=\s*["']([+-]?(?:\d+(?:\.\d+)?|\.\d+))["']/gi
    )].some(([, fraction]) => Number(fraction) > 0);
    if (hasPositiveAnswer) return true;
  }
  return false;
}

// Moodle GIFT may be stored with either .gift or .txt extension. Require a
// function-scoped item title and a keyed answer, not just explanatory prose.
function containsGiftDgrAnswerKey(text) {
  // GIFT supports "=" answers, true/false, numerical answers, and multiple-
  // response questions with positive partial-credit weights but NO "=" at all.
  // See Moodle's GIFT "Multiple Answers" and numerical examples.
  if (!/::\s*Q-7\.(?:10|[1-9])-\d{3}(?!\d)\s*::/i.test(text)) return false;
  const positiveWeightedChoices = [...text.matchAll(/\{([^{}]*)\}/gs)].some(([, choices]) =>
    [...choices.matchAll(/~\s*%\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*%\s*(?=\S)/g)]
      .some(([, weight]) => Number(weight) > 0)
  );
  return /\{[^{}]*=\s*[^\s{}][^{}]*\}/s.test(text)
    || /\{\s*(?:T|F|TRUE|FALSE)(?:\s*#[^{}]*)?\s*\}/i.test(text)
    || /\{\s*#\s*[-+]?(?:\d+(?:\.\d+)?|\.\d+)(?:[^{}]*)\}/s.test(text)
    || /\{\s*#\s*=\s*(?:%[+-]?(?:\d+(?:\.\d+)?|\.\d+)%\s*)?[-+]?(?:\d+(?:\.\d+)?|\.\d+)/s.test(text)
    || positiveWeightedChoices;
}

function containsKeyedDgrSection(text) {
  const headings = [...text.matchAll(questionHeading)];
  for (let i = 0; i < headings.length; i += 1) {
    const start = headings[i].index;
    const end = i + 1 < headings.length ? headings[i + 1].index : text.length;
    const section = text.slice(start, end);
    const keyedProductionItem = /\*\*Stem\s*\(FR\)\s*:/i.test(section)
      && /\*\*Options\s*:/i.test(section)
      && /\*\*Correct answer rationale\s*:/i.test(section);
    // Bilingual reviewer packages include copied confidential FR item text,
    // even where the answer rationale is not printed in the EN section.
    const bilingualReviewerItem = /\*\*FR text\s*\(verbatim\b/i.test(section)
      && /\*\*EN draft translation\b/i.test(section)
      && /\*\*Stem\s*:/i.test(section)
      && /\*\*Options\s*:/i.test(section);
    if (keyedProductionItem || bilingualReviewerItem) return true;
  }
  return false;
}

function selfTest() {
  const cases = [
    ["docs/DGR_PRODUCTION_BANK_7.1.md", true],
    ["docs/DGR_PRODUCTION_BANK_7.10.md", true],
    ["archive/docs/DGR_EN_REVIEW_PACKAGE_7.8.md", true],
    ["docs/DGR_EN_REVIEW_PACKAGE_7.2.MD", true],
    ["docs/DGR_SOURCE_COMPETENCY_MATRIX_7.2.md", false],
    ["docs/DGR_STAGE2A_FUNCTION_7.2_BLUEPRINT.md", false],
    ["docs/DGR_PRODUCTION_BANK_7.11.md", false],
    ["docs/DGR_PRODUCTION_BANK_7.100.md", false],
    ["docs/DGR_PRODUCTION_BANK_7.1-copy.md", true],
    ["docs/DGR_PRODUCTION_BANK_7.10_backup.md", true],
    ["archive/DGR_EN_REVIEW_PACKAGE_7.2 (copy).md", true],
    ["docs/DGR_PRODUCTION_BANK_7.1.md.bak", true],
    ["docs/DGR_PRODUCTION_BANK_7.3.txt", true],
  ];
  const renamedKeyedMarkdown = [
    "## Q-7.2-001 — synthetic fixture",
    "**Stem (FR):** synthetic",
    "**Options:** synthetic",
    "**Correct answer rationale:** synthetic only",
  ].join("\n");
  const nonKeyedMarkdown = [
    "## Q-7.2-001 — synthetic fixture",
    "Reviewer guidance: do not include answer keys.",
    "A note mentions correct answer rationale as a concept, not an item field.",
  ].join("\n");
  const renamedBilingualPackage = [
    "## Q-7.10-001 — synthetic reviewer fixture",
    "**FR text (verbatim from production bank):**",
    "**Stem:** placeholder",
    "**Options:** placeholder",
    "**EN draft translation:** placeholder",
  ].join("\n");
  const moodleXmlCases = [
    ['<quiz><question type="cloze"><name><text>Q-7.3-901</text></name><questiontext><text><![CDATA[synthetic {1:MC:=placeholder key~other}]]></text></questiontext></question></quiz>', true],
    ['<quiz><question type="cloze"><name><text>Q-7.10-901</text></name><questiontext><text><![CDATA[synthetic {1:SA:wrong~%50%placeholder key}]]></text></questiontext></question></quiz>', true],
    ['<quiz><question type="cloze"><name><text>Q-7.2-901</text></name><questiontext><text><![CDATA[synthetic {1:NM:=42:0.1}]]></text></questiontext></question></quiz>', true],
    ['<quiz><question type="cloze"><name><text>Q-7.2-901</text></name><questiontext><text><![CDATA[synthetic {1:MC:wrong~%-50%other}]]></text></questiontext></question></quiz>', false],
    ['<quiz><question type="cloze"><name><text>Q-7.11-901</text></name><questiontext><text><![CDATA[synthetic {1:MC:=placeholder key}]]></text></questiontext></question></quiz>', false],
    ['<quiz><question type="cloze"><name><text>Other-item</text></name><questiontext><text><![CDATA[synthetic {1:MC:=placeholder key}]]></text></questiontext></question><question type="cloze"><name><text>Q-7.2-901</text></name><questiontext><text>nonkeyed</text></questiontext></question></quiz>', false],
    ['<quiz><question type="multichoice"><name><text>Q-7.3-901</text></name><single>false</single><answer fraction="50"><text>synthetic A</text></answer><answer fraction="50"><text>synthetic B</text></answer><answer fraction="-50"><text>synthetic C</text></answer></question></quiz>', true],
    ['<quiz><question type="multichoice"><name><text>Q-7.10-901</text></name><answer fraction="33.33333"><text>synthetic</text></answer></question></quiz>', true],
    ['<quiz><question type="multichoice"><name><text>Q-7.2-901</text></name><answer fraction="-50"><text>synthetic</text></answer></question></quiz>', false],
    ['<quiz><question type="multichoice"><name><text>Q-7.11-901</text></name><answer fraction="50"><text>synthetic</text></answer></question></quiz>', false],
    ['<quiz><question type="multichoice"><name><text>Q-7.2-901</text></name><answer fraction="100"><text>synthetic</text></answer></question></quiz>', true],
    ['<quiz><question type="truefalse"><name><text>Q-7.10-901</text></name><answer fraction="100"><text>synthetic</text></answer></question></quiz>', true],
    ['<quiz><question type="multichoice"><name><text>Q-7.11-901</text></name><answer fraction="100"><text>synthetic</text></answer></question></quiz>', false],
    ['<quiz><question type="multichoice"><name><text>Q-7.2-901</text></name><answer fraction="0"><text>synthetic</text></answer></question></quiz>', false],
    // Mixed Moodle exports: unrelated answer keys must not cross question boundaries.
    ['<quiz><question type="multichoice"><name><text>Other-item</text></name><answer fraction="100"><text>synthetic key</text></answer></question><question type="multichoice"><name><text>Q-7.2-901</text></name><answer fraction="0"><text>synthetic non-key</text></answer></question></quiz>', false],
    ['<quiz><question type="multichoice"><name><text>Q-7.10-901</text></name><answer fraction="-50"><text>synthetic non-key</text></answer></question><question type="truefalse"><name><text>Other-item</text></name><answer fraction="100"><text>synthetic key</text></answer></question></quiz>', false],
    ['<quiz><question type="multichoice"><name><text>Other-item</text></name><answer fraction="100"><text>synthetic key</text></answer></question><question type="multichoice"><name><text>Q-7.3-901</text></name><answer fraction="50"><text>synthetic DGR key</text></answer></question></quiz>', true],
  ];
  const giftCases = [
    ['::Q-7.2-901::Synthetic fixture question {=Synthetic keyed choice ~Distractor}', true],
    ['::Q-7.10-901::Synthetic fixture question {~Wrong =Correct}', true],
    ['::Q-7.2-901::Synthetic question {= Correct keyed choice ~ Distractor}', true],
    ['::Q-7.2-901::Synthetic question {\n= Correct keyed choice\n~ Distractor\n}', true],
    ['::Q-7.2-901::Synthetic true-false question {TRUE}', true],
    ['::Q-7.10-901::Synthetic true-false question {F}', true],
    ['::Q-7.2-901::Synthetic numerical question {#42:1}', true],
    ['::Q-7.2-901::Synthetic numerical question {#-3.14:0.1}', true],
    ['::Q-7.3-901::Synthetic multi-answer question {~%50%Alpha ~%50%Beta ~%-50%Gamma}', true],
    ['::Q-7.10-901::Synthetic weighted-answer question {~%33.33333%Alpha ~%66.66667%Beta}', true],
    ['::Q-7.2-901::Synthetic numerical range {#\\n=1822:0\\n=%50%1822:2}', true],
    ['::Q-7.2-901::Zero-only weighting is not keyed {~%0%Alpha ~%-50%Beta}', false],
    ['::Q-7.2-901::Negative-only weighting is not keyed {~%-100%Alpha}', false],
    ['::Q-7.2-901::Blank answer marker {=   }', false],
    ['::Q-7.2-901::Nonkeyed explanation {ordinary words}', false],
    ['::Q-7.11-901::Outside-scope GIFT true-false question {TRUE}', false],
    ['::Q-7.2-901::Explanatory sample without an answer', false],
    ['::Q-7.11-901::Synthetic question {=Synthetic keyed choice}', false],
  ];
  const structuredCases = [
    ['question_id,question_text,correct_answer\nQ-7.2-001,synthetic,option A', true],
    ['{"questionId":"Q-7.10-001","stem":"synthetic","answerKey":"A"}', true],
    ['KOST_Question_ID,Correct_Answer_Recoverable,Final_Reconciled_Status\nQ-7.2-001,NO,BLOCKER', false],
    ['question_id,question_text,correct_answer\nQ-7.11-001,synthetic,option A', false],
    ['{"question":"synthetic","answer":"A"}', false],
  ];
  if (!containsKeyedDgrSection(renamedKeyedMarkdown)
    || !containsKeyedDgrSection(renamedBilingualPackage)
    || structuredCases.some(([fixture, expected]) => containsStructuredDgrAnswerKey(fixture) !== expected)
    || moodleXmlCases.some(([fixture, expected]) => containsMoodleXmlDgrAnswerKey(fixture) !== expected)
    || giftCases.some(([fixture, expected]) => containsGiftDgrAnswerKey(fixture) !== expected)
    || containsKeyedDgrSection(nonKeyedMarkdown)
    || containsKeyedDgrSection("No item headings; **Stem (FR):** x **Options:** y **Correct answer rationale:** z")) {
    throw new Error("Exam-content keyed Markdown regression fixture failed.");
  }
  const failures = cases.filter(([name, expected]) => isRestricted(name) !== expected);
  if (failures.length) {
    console.error("Exam-content path guard self-test FAILED.");
    process.exitCode = 1;
    return;
  }
  console.log("Exam-content path guard self-test passed.");
}

if (process.argv.includes("--self-test")) {
  selfTest();
} else {
  const tracked = execFileSync("git", ["ls-files", "--cached", "-z"], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  }).split("\0").filter(Boolean);
  const exposedPaths = tracked.filter(isRestricted);
  const keyedContent = [];
  const unscannedLargeText = [];
  for (const file of tracked) {
    if (isRestricted(file) || !candidateTextExtensions.test(file)) continue;
    const stat = statSync(file);
    if (!stat.isFile()) continue;
    if (stat.size > MAX_TEXT_BYTES) {
      unscannedLargeText.push(file);
      continue; // Fail closed below; never silently bless unscanned text.
    }
    const text = readFileSync(file, "utf8");
    const hasKey = structuredTextExtensions.test(file)
      ? containsStructuredDgrAnswerKey(text)
      : moodleXmlExtension.test(file)
        ? containsMoodleXmlDgrAnswerKey(text)
        : containsKeyedDgrSection(text) || (giftExtension.test(file) && containsGiftDgrAnswerKey(text));
    if (hasKey) keyedContent.push(file);
  }
  if (exposedPaths.length || keyedContent.length || unscannedLargeText.length) {
    console.error("RELEASE BLOCKED: public repository exam-content boundary requires remediation.");
    for (const file of exposedPaths) console.error(` - known exam-bank path: ${file}`);
    for (const file of keyedContent) console.error(` - DGR exam content detected in tracked text file: ${file}`);
    for (const file of unscannedLargeText) console.error(` - oversized text file needs confidential-content review: ${file}`);
    console.error(
      "Transfer confidential examination content to owner-authorized restricted storage. " +
      "Already-fetched public copies are not retractable. See issue #340."
    );
    process.exitCode = 1;
  } else {
    console.log(
      "Known DGR artifact paths and high-confidence keyed Markdown, bilingual and structured exports not found. " +
      "This does NOT prove confidentiality: alternate formats, history, forks, artifacts, and runtime exposure remain unassessed."
    );
  }
}
