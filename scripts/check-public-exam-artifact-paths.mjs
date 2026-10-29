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
  const questions = text.matchAll(/<question\b[^>]*\btype\s*=\s*["'](?:cloze|multianswer)["'][^>]*>([\s\S]*?)<\/question\s*>/gi);
  for (const [, question] of questions) {
    if (!dgrQuestionId.test(question)) continue;
    const texts = question.matchAll(/<questiontext\b[^>]*>([\s\S]*?)<\/questiontext\s*>/gi);
    for (const [, questionText] of texts) {
      const embedded = questionText.matchAll(
        /\{\s*(?:\d+(?:\.\d+)?)?\s*:\s*(?:SHORTANSWER(?:_C)?|MULTICHOICE(?:_(?:VS|HS|V|H|S))?|MULTIRESPONSE(?:_(?:HS|H|S))?|NUMERICAL|SA|SAC|MC(?:VS|HS|V|H|S)?|MR(?:HS|H|S)?|NM|MW|MWC)\s*:\s*([^{}]*)\}/gi
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
// Moodle's ddimageortext and ddmarker export their grading mapping as
// <drop><choice>N</choice></drop> tied to <drag><no>N</no>.
// Neither type requires a positive <answer fraction>. Keep all evidence
// within a single DGR question to avoid mixed-export false positives.
// Detection is deliberately high-confidence and does not parse every XML variant.
function containsKeyedDgrImageDragXml(attrs, question) {
  if (!/\btype\s*=\s*["'](?:ddimageortext|ddmarker)["']/i.test(attrs)
    || !dgrQuestionId.test(question)) return false;
  const referenced = new Set(
    [...question.matchAll(/<drop\b[^>]*>([\s\S]*?)<\/drop\s*>/gi)]
      .map(([, drop]) => /<choice\b[^>]*>\s*([1-9]\d*)\s*<\/choice\s*>/i.exec(drop)?.[1])
      .filter(Boolean)
  );
  if (!referenced.size) return false;
  for (const [, drag] of question.matchAll(/<drag\b[^>]*>([\s\S]*?)<\/drag\s*>/gi)) {
    const number = /<no\b[^>]*>\s*([1-9]\d*)\s*<\/no\s*>/i.exec(drag)?.[1];
    if (!number || !referenced.has(number)) continue;
    const labelled = [...drag.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text\s*>/gi)]
      .some(([, value]) => Boolean(value.replace(/<!\[CDATA\[|\]\]>/g, "").trim()));
    const image = /<file\b[^>]*\bname\s*=\s*["'][^"']+["'][^>]*>/i.test(drag);
    if (labelled || image) return true;
  }
  return false;
}

function containsMoodleXmlDgrAnswerKey(text) {
  if (containsKeyedDgrClozeXml(text)) return true;
  // Scope the DGR item identity, Moodle question type and answer fraction
  // to the SAME <question>. A non-DGR keyed question elsewhere in a mixed
  // export must not make an unkeyed DGR question appear confidentially keyed.
  const questions = text.matchAll(/<question\b([^>]*)>([\s\S]*?)<\/question\s*>/gi);
  for (const [, attrs, question] of questions) {
    if (containsKeyedDgrImageDragXml(attrs, question)) return true;
    // Moodle matching exports store each correct pairing as an unweighted
    // <subquestion><answer><text>...</text></answer></subquestion>. There is
    // no positive fraction attribute. Keep the DGR ID and its pairing inside
    // the SAME Moodle question to avoid mixed-export false positives.
    if (/\btype\s*=\s*["']matching["']/i.test(attrs) && dgrQuestionId.test(question)) {
      for (const [, subquestion] of question.matchAll(/<subquestion\b[^>]*>([\s\S]*?)<\/subquestion\s*>/gi)) {
        const pair = /<answer\b[^>]*>\s*<text\b[^>]*>([\s\S]*?)<\/text\s*>\s*<\/answer\s*>/i.exec(subquestion);
        if (pair && pair[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim()) return true;
      }
    }
    // Moodle gapselect and ddwtos serialize the correct choice as a
    // [[1-based choice index]] in questiontext, with non-fractional choices
    // under <selectoption> / <dragbox>. The mapping itself is an answer key.
    // Require a real referenced, nonempty option IN THE SAME DGR question.
    const indexedType = /\btype\s*=\s*["'](gapselect|ddwtos)["']/i.exec(attrs)?.[1]?.toLowerCase();
    if (indexedType && dgrQuestionId.test(question)) {
      const questionText = /<questiontext\b[^>]*>([\s\S]*?)<\/questiontext\s*>/i.exec(question)?.[1] ?? "";
      const referenced = new Set(
        [...questionText.matchAll(/\[\[\s*([1-9]\d*)\s*\]\]/g)].map(([, n]) => Number(n))
      );
      if (referenced.size) {
        const tag = indexedType === "gapselect" ? "selectoption" : "dragbox";
        const optionBlocks = [...question.matchAll(
          new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}\\s*>`, "gi")
        )];
        if (optionBlocks.some(([, option], index) => {
          if (!referenced.has(index + 1)) return false;
          const value = /<text\b[^>]*>([\s\S]*?)<\/text\s*>/i.exec(option)?.[1] ?? "";
          return Boolean(value.replace(/<!\[CDATA\[|\]\]>/g, "").trim());
        })) return true;
      }
    }
    if (!/\btype\s*=\s*["'](?:multichoice|truefalse|shortanswer|matching|numerical|calculated|calculatedsimple|calculatedmulti)["']/i.test(attrs)
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
  // In valid GIFT, a blank line separates question records. The DGR ID
  // and a keyed answer must occur in the SAME record: an unrelated keyed
  // question elsewhere in the export cannot key an unkeyed DGR question.
  // This remains a narrow high-confidence tripwire, not a full GIFT parser.
  const records = text.split(/\r?\n[ \t]*\r?\n/);
  return records.some((record) => {
    if (!/::\s*Q-7\.(?:10|[1-9])-\d{3}(?!\d)\s*::/i.test(record)) return false;
    const positiveWeightedChoices = [...record.matchAll(/\{([^{}]*)\}/gs)].some(([, choices]) =>
      [...choices.matchAll(/~\s*%\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*%\s*(?=\S)/g)]
        .some(([, weight]) => Number(weight) > 0)
    );
    return /\{[^{}]*=\s*[^\s{}][^{}]*\}/s.test(record)
      || /\{\s*(?:T|F|TRUE|FALSE)(?:\s*#[^{}]*)?\s*\}/i.test(record)
      || /\{\s*#\s*[-+]?(?:\d+(?:\.\d+)?|\.\d+)(?:[^{}]*)\}/s.test(record)
      || /\{\s*#\s*=\s*(?:%[+-]?(?:\d+(?:\.\d+)?|\.\d+)%\s*)?[-+]?(?:\d+(?:\.\d+)?|\.\d+)/s.test(record)
      || positiveWeightedChoices;
  });
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
  // Moodle's documented Cloze shuffled multichoice and multiresponses
  // must not bypass this public-answer-key tripwire (synthetic items only).
  const clozeVariants = [
    "MULTICHOICE_S", "MULTICHOICE_VS", "MULTICHOICE_HS",
    "MCS", "MCVS", "MCHS",
    "MULTIRESPONSE", "MULTIRESPONSE_H", "MULTIRESPONSE_S", "MULTIRESPONSE_HS",
    "MR", "MRH", "MRS", "MRHS",
  ];
  const moodleXmlCases = [
    // Moodle 5.x ddimageortext/ddmarker: <drop><choice>N</choice>
    // refers to a specific <drag><no>N</no> instead of an answer fraction.
    ['<quiz><question type="ddimageortext"><name><text>Q-7.2-901</text></name><drag><no>2</no><text>Synthetic labelled key</text></drag><drop><no>1</no><choice>2</choice></drop></question></quiz>', true],
    ['<quiz><question type="ddmarker"><name><text>Q-7.8-901</text></name><drag><no>1</no><text>Synthetic marker</text></drag><drop><no>1</no><shape>rectangle</shape><choice>1</choice></drop></question></quiz>', true],
    ['<quiz><question type="ddimageortext"><name><text>Q-7.10-901</text></name><drag><no>3</no><file name="synthetic-image.png">fixture</file></drag><drop><no>1</no><choice>3</choice></drop></question></quiz>', true],
    ['<quiz><question type="ddmarker"><name><text>Q-7.11-901</text></name><drag><no>1</no><text>Outside scope</text></drag><drop><choice>1</choice></drop></question></quiz>', false],
    ['<quiz><question type="ddimageortext"><name><text>Q-7.4-901</text></name><drag><no>1</no><text>Unreferenced</text></drag><drop><choice>2</choice></drop></question></quiz>', false],
    ['<quiz><question type="ddmarker"><name><text>Q-7.5-901</text></name><drag><no>1</no><text>Unreferenced</text></drag><drop><choice>0</choice></drop></question></quiz>', false],
    ['<quiz><question type="ddimageortext"><name><text>Q-7.6-901</text></name><drag><no>1</no><text> </text></drag><drop><choice>1</choice></drop></question></quiz>', false],
    ['<quiz><question type="ddmarker"><name><text>Other-item</text></name><drag><no>1</no><text>Other key</text></drag><drop><choice>1</choice></drop></question><question type="ddmarker"><name><text>Q-7.9-901</text></name><drag><no>1</no><text>Unkeyed</text></drag><drop><choice>2</choice></drop></question></quiz>', false],
    ['<quiz><question type="ddimageortext"><name><text>Other-item</text></name><drag><no>1</no><text>Other key</text></drag><drop><choice>1</choice></drop></question><question type="ddimageortext"><name><text>Q-7.3-901</text></name><drag><no>2</no><text>DGR keyed</text></drag><drop><choice>2</choice></drop></question></quiz>', true],
    // Moodle 5.x gapselect/ddwtos encode keyed word choices via 1-based
    // [[n]] positions; no positive <answer fraction> is required.
    ['<quiz><question type="gapselect"><name><text>Q-7.4-901</text></name><questiontext><text><![CDATA[Synthetic [[2]] blank]]></text></questiontext><selectoption><text>Distractor</text></selectoption><selectoption><text>Synthetic keyed choice</text></selectoption></question></quiz>', true],
    ['<quiz><question type="ddwtos"><name><text>Q-7.6-901</text></name><questiontext><text><![CDATA[Drag [[1]] here]]></text></questiontext><dragbox><text>Synthetic keyed choice</text></dragbox></question></quiz>', true],
    ['<quiz><question type="gapselect"><name><text>Q-7.11-901</text></name><questiontext><text>[[1]]</text></questiontext><selectoption><text>Synthetic</text></selectoption></question></quiz>', false],
    ['<quiz><question type="gapselect"><name><text>Q-7.5-901</text></name><questiontext><text>[[3]]</text></questiontext><selectoption><text>Unreferenced choice</text></selectoption></question></quiz>', false],
    ['<quiz><question type="ddwtos"><name><text>Q-7.8-901</text></name><questiontext><text>No gaps</text></questiontext><dragbox><text>Unreferenced choice</text></dragbox></question></quiz>', false],
    ['<quiz><question type="gapselect"><name><text>Other-item</text></name><questiontext><text>[[1]]</text></questiontext><selectoption><text>Other key</text></selectoption></question><question type="gapselect"><name><text>Q-7.7-901</text></name><questiontext><text>No gaps</text></questiontext><selectoption><text>Synthetic</text></selectoption></question></quiz>', false],
    ['<quiz><question type="gapselect"><name><text>Other-item</text></name><questiontext><text>[[1]]</text></questiontext><selectoption><text>Other key</text></selectoption></question><question type="ddwtos"><name><text>Q-7.10-901</text></name><questiontext><text>[[1]]</text></questiontext><dragbox><text>Synthetic DGR choice</text></dragbox></question></quiz>', true],
    // Moodle's matching format has no fraction weights; the pairing itself is the key.
    ['<quiz><question type="matching"><name><text>Q-7.4-901</text></name><subquestion><text>Synthetic left</text><answer><text>Synthetic right</text></answer></subquestion></question></quiz>', true],
    ['<quiz><question type="matching"><name><text>Q-7.10-901</text></name><subquestion><text>Left</text><answer><text><![CDATA[<b>synthetic right</b>]]></text></answer></subquestion></question></quiz>', true],
    ['<quiz><question type="matching"><name><text>Q-7.8-901</text></name><subquestion><text>Left</text><answer><text>  </text></answer></subquestion></question></quiz>', false],
    ['<quiz><question type="matching"><name><text>Q-7.11-901</text></name><subquestion><text>Left</text><answer><text>synthetic right</text></answer></subquestion></question></quiz>', false],
    ['<quiz><question type="matching"><name><text>Other-item</text></name><subquestion><text>Left</text><answer><text>synthetic right</text></answer></subquestion></question><question type="matching"><name><text>Q-7.2-901</text></name><subquestion><text>Left</text><answer><text></text></answer></subquestion></question></quiz>', false],
    ['<quiz><question type="matching"><name><text>Other-item</text></name><subquestion><text>Left</text><answer><text>synthetic right</text></answer></subquestion></question><question type="matching"><name><text>Q-7.7-901</text></name><subquestion><text>Left</text><answer><text>synthetic DGR key</text></answer></subquestion></question></quiz>', true],
    ...clozeVariants.map((type) => [
      `<quiz><question type="cloze"><name><text>Q-7.7-901</text></name><questiontext><text><![CDATA[synthetic {1:${type}:=synthetic key~other}]]></text></questiontext></question></quiz>`,
      true,
    ]),
    ['<quiz><question type="cloze"><name><text>Q-7.9-901</text></name><questiontext><text><![CDATA[synthetic {1:MRHS:~%50%synthetic partial credit~other}]]></text></questiontext></question></quiz>', true],
    ['<quiz><question type="cloze"><name><text>Q-7.7-901</text></name><questiontext><text><![CDATA[synthetic {1:MCS:wrong~%0%zero~%-50%negative}]]></text></questiontext></question></quiz>', false],
    ['<quiz><question type="cloze"><name><text>Q-7.11-901</text></name><questiontext><text><![CDATA[synthetic {1:MRHS:=synthetic key}]]></text></questiontext></question></quiz>', false],
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
    // Calculated variants carry positive correct-answer fractions.
    // An unrelated item must not key a DGR question in a mixed export.
    ['<quiz><question type="calculated"><name><text>Q-7.2-901</text></name><answer fraction="100"><text>{x}+1</text></answer></question></quiz>', true],
    ['<quiz><question type="calculatedsimple"><name><text>Q-7.5-901</text></name><answer fraction="100"><text>{x}+1</text></answer></question></quiz>', true],
    ['<quiz><question type="calculatedmulti"><name><text>Q-7.9-901</text></name><answer fraction="50"><text>{x}+1</text></answer></question></quiz>', true],
    ['<quiz><question type="calculatedsimple"><name><text>Q-7.11-901</text></name><answer fraction="100"><text>{x}+1</text></answer></question></quiz>', false],
    ['<quiz><question type="calculatedmulti"><name><text>Q-7.4-901</text></name><answer fraction="0"><text>zero credit</text></answer></question></quiz>', false],
    ['<quiz><question type="calculatedsimple"><name><text>Other-item</text></name><answer fraction="100"><text>Other key</text></answer></question><question type="calculated"><name><text>Q-7.3-901</text></name><answer fraction="0"><text>Unkeyed</text></answer></question></quiz>', false],
    // Some import/export adapters use the internal multianswer alias for Cloze.
    ['<quiz><question type="multianswer"><name><text>Q-7.10-901</text></name><questiontext><text><![CDATA[Synthetic {1:SA:=answer}]]></text></questiontext></question></quiz>', true],
    ['<quiz><question type="multianswer"><name><text>Q-7.11-901</text></name><questiontext><text><![CDATA[Synthetic {1:SA:=answer}]]></text></questiontext></question></quiz>', false],
    ['<quiz><question type="multianswer"><name><text>Other-item</text></name><questiontext><text><![CDATA[Synthetic {1:SA:=answer}]]></text></questiontext></question><question type="multianswer"><name><text>Q-7.8-901</text></name><questiontext><text>Unkeyed</text></questiontext></question></quiz>', false],
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
    // Mixed GIFT exports: a key from another question must not leak across
    // record boundaries into an unkeyed DGR item.
    ['::Other-item::Unrelated keyed choice {=Synthetic key}\n\n::Q-7.2-901::Unkeyed DGR {ordinary words}', false],
    ['::Q-7.3-901::Unkeyed DGR {~%0%No credit}\n\n::Other-item::Unrelated true/false {TRUE}', false],
    ['::Other-item::Unrelated weighted key {~%50%Synthetic}\n\n::Q-7.10-901::Unkeyed DGR {ordinary words}', false],
    ['::Other-item::Unrelated keyed choice {=Synthetic}\n\n::Q-7.2-901::Keyed DGR {=Synthetic key}', true],
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
