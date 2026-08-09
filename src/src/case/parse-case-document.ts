import { InvalidCaseDocumentError } from '../errors/invalid-case-document.error.js';
import { CASE_DOCUMENT_ENDING, type Case, type Hypothesis, type Resolution } from './case.js';

/** The refusal a case declaring no hypothesis is named with (rules/knowledge/a-case-has-at-least-one-hypothesis). */
const NO_HYPOTHESIS_PROBLEM = 'the case declares no hypothesis';

/**
 * Parses one case JSON document into the whole aggregate — hypotheses,
 * resolutions and referrals all read from the one document, never from a
 * second store (constraints/a-case-is-stored-as-one-json-document). The
 * document arrives as its parsed JSON data plus the name of the file that
 * holds it, which the slug is held to
 * (rules/knowledge/the-slug-matches-the-file-name); a document violating any
 * structural rule is refused once, with every violation named, and no
 * missing part is ever defaulted or coerced. What the structural rules do
 * not decide — a term existing in the glossary, a concept's capability —
 * is no concern of this parse: those checks read other contexts and belong
 * to the coherence validation, which is why this module imports nothing
 * beyond its own types and its typed error
 * (constraints/the-domain-depends-on-no-infrastructure).
 */
export function parseCaseDocument(document: unknown, fileName: string): Case {
  refuseStructuralViolations(document, fileName);
  return heldCase(document);
}

/**
 * Refuses a document violating any structural rule, once, with every
 * violation named (domain/knowledge/case) — the checks below are the whole
 * of what this assertion claims.
 */
function refuseStructuralViolations(document: unknown, fileName: string): asserts document is Case {
  const problems = documentProblems(document, fileName);
  if (problems.length > 0) {
    throw new InvalidCaseDocumentError(fileName, problems);
  }
}

/** Every way one document violates the structural rules, collected in one pass. */
function documentProblems(document: unknown, fileName: string): string[] {
  if (!isRecord(document)) {
    return ['the document is not one JSON object'];
  }
  return [
    ...stringProblems(document['slug'], 'slug'),
    ...slugProblems(document['slug'], fileName),
    ...stringProblems(document['title'], 'title'),
    ...stringProblems(document['when_to_use'], 'when_to_use'),
    ...versionProblems(document['version']),
    ...stringProblems(document['hash'], 'hash'),
    ...stringProblems(document['subject'], 'subject'),
    ...resolutionProblems(document['fallback'], 'the fallback'),
    ...hypothesesProblems(document['hypotheses']),
  ];
}

/**
 * Whether the slug equals the name of the file that holds it
 * (rules/knowledge/the-slug-matches-the-file-name) — judged only once the
 * slug is declared at all, so one absence is not reported twice.
 */
function slugProblems(slug: unknown, fileName: string): string[] {
  if (typeof slug !== 'string' || slug === '') {
    return [];
  }
  const name = heldFileName(fileName);
  return slug === name
    ? []
    : [`the slug "${slug}" does not equal the name "${name}" of the file that holds it`];
}

/**
 * The name of the file as the slug rule reads it: the `.json` ending the
 * one-document constraint gives the medium
 * (constraints/a-case-is-stored-as-one-json-document) is not part of the
 * name, so a caller may state the file with or without it.
 */
function heldFileName(fileName: string): string {
  return fileName.endsWith(CASE_DOCUMENT_ENDING)
    ? fileName.slice(0, -CASE_DOCUMENT_ENDING.length)
    : fileName;
}

/**
 * How one required string attribute departs from its declaration: absent,
 * not a string, or empty — an empty attribute declares nothing, so it is
 * refused rather than defaulted, the convention this tree's refusals share.
 */
function stringProblems(value: unknown, subject: string): string[] {
  if (value === undefined) {
    return [`${subject} is undeclared`];
  }
  if (typeof value !== 'string') {
    return [`${subject} is not a string`];
  }
  return value === '' ? [`${subject} is empty`] : [];
}

/** How the version departs from its declaration: the case declares it as an integer (domain/knowledge/case). */
function versionProblems(value: unknown): string[] {
  if (value === undefined) {
    return ['version is undeclared'];
  }
  return Number.isInteger(value) ? [] : ['version is not an integer'];
}

/**
 * How the document's hypotheses violate the structural rules: at least one
 * hypothesis declared (rules/knowledge/a-case-has-at-least-one-hypothesis),
 * each one complete, and no name shared.
 */
function hypothesesProblems(value: unknown): string[] {
  if (value === undefined) {
    return [NO_HYPOTHESIS_PROBLEM];
  }
  if (!Array.isArray(value)) {
    return ['hypotheses is not an array of hypotheses'];
  }
  const hypotheses: readonly unknown[] = value;
  if (hypotheses.length === 0) {
    return [NO_HYPOTHESIS_PROBLEM];
  }
  return [
    ...hypotheses.flatMap((hypothesis, index) => hypothesisProblems(hypothesis, positionOf(index))),
    ...sharedNameProblems(hypotheses),
  ];
}

/**
 * How one hypothesis violates the structural rules: a name
 * (domain/knowledge/hypothesis), a non-empty criterion
 * (rules/knowledge/a-hypothesis-declares-a-criterion), at least one
 * collected concept, and a complete resolution.
 */
function hypothesisProblems(value: unknown, position: string): string[] {
  if (!isRecord(value)) {
    return [`${position} is not one JSON object`];
  }
  return [
    ...stringProblems(value['name'], `${position}'s name`),
    ...stringProblems(value['criterion'], `${position}'s criterion`),
    ...collectsProblems(value['collects'], position),
    ...resolutionProblems(value['resolution'], `${position}'s resolution`),
  ];
}

/**
 * How one hypothesis's collects violates its declaration: at least one
 * concept, each entry naming one
 * (rules/knowledge/a-hypothesis-collects-at-least-one-concept).
 */
function collectsProblems(value: unknown, position: string): string[] {
  if (value === undefined) {
    return [`${position} collects no concept`];
  }
  if (!Array.isArray(value)) {
    return [`${position}'s collects is not an array of concept names`];
  }
  const entries: readonly unknown[] = value;
  if (entries.length === 0) {
    return [`${position} collects no concept`];
  }
  return entries.every((name) => typeof name === 'string' && name !== '')
    ? []
    : [`${position}'s collects holds an entry that names no concept`];
}

/**
 * Every name more than one hypothesis declares, one problem per shared name
 * naming the positions that share it
 * (rules/knowledge/a-hypothesis-name-is-unique-within-its-case).
 */
function sharedNameProblems(hypotheses: readonly unknown[]): string[] {
  const positions = new Map<string, number[]>();
  for (const [index, hypothesis] of hypotheses.entries()) {
    const name = declaredName(hypothesis);
    if (name !== undefined) {
      positions.set(name, [...(positions.get(name) ?? []), index + 1]);
    }
  }
  return [...positions.entries()]
    .filter(([, at]) => at.length > 1)
    .map(([name, at]) => `hypotheses ${at.join(', ')} share the name "${name}"`);
}

/** The name one hypothesis record declares, where it declares one at all. */
function declaredName(hypothesis: unknown): string | undefined {
  if (!isRecord(hypothesis)) {
    return undefined;
  }
  const name = hypothesis['name'];
  return typeof name === 'string' && name !== '' ? name : undefined;
}

/** Names one hypothesis's position as a reader counts them: the first hypothesis is hypothesis 1. */
function positionOf(index: number): string {
  return `hypothesis ${index + 1}`;
}

/**
 * How one position's resolution violates its declaration: declared at all,
 * one JSON object, and an outcome paired with a referral so no position can
 * declare one without the other
 * (rules/knowledge/every-position-declares-a-resolution,
 * domain/knowledge/resolution).
 */
function resolutionProblems(value: unknown, subject: string): string[] {
  if (value === undefined) {
    return [`${subject} is undeclared`];
  }
  if (!isRecord(value)) {
    return [`${subject} is not one JSON object`];
  }
  return [
    ...stringProblems(value['outcome'], `${subject}'s outcome`),
    ...referralProblems(value['referral'], `${subject}'s referral`),
  ];
}

/**
 * How one resolution's referral violates its declaration: one action and
 * one recipient, both named (domain/knowledge/referral).
 */
function referralProblems(value: unknown, subject: string): string[] {
  if (value === undefined) {
    return [`${subject} is undeclared`];
  }
  if (!isRecord(value)) {
    return [`${subject} is not one JSON object`];
  }
  return [
    ...stringProblems(value['action'], `${subject}'s action`),
    ...stringProblems(value['recipient'], `${subject}'s recipient`),
  ];
}

/**
 * The aggregate as the document declares it: exactly the declared
 * attributes, so nothing undeclared travels in, and the hypotheses in the
 * document's own order — the precedence the experts affirm, which
 * resolve-outcome will consume
 * (rules/knowledge/hypotheses-are-ordered-by-precedence) — never reordered
 * and never keyed by name.
 */
function heldCase(document: Case): Case {
  return {
    slug: document.slug,
    title: document.title,
    when_to_use: document.when_to_use,
    version: document.version,
    hash: document.hash,
    subject: document.subject,
    fallback: heldResolution(document.fallback),
    hypotheses: document.hypotheses.map(heldHypothesis),
  };
}

/** One hypothesis exactly as declared, its collects kept in the document's order. */
function heldHypothesis(hypothesis: Hypothesis): Hypothesis {
  return {
    name: hypothesis.name,
    criterion: hypothesis.criterion,
    collects: [...hypothesis.collects],
    resolution: heldResolution(hypothesis.resolution),
  };
}

/** One resolution exactly as declared: the outcome and the referral it pairs. */
function heldResolution(resolution: Resolution): Resolution {
  return {
    outcome: resolution.outcome,
    referral: {
      action: resolution.referral.action,
      recipient: resolution.referral.recipient,
    },
  };
}

/** Whether one JSON value is one JSON object — the only shape a record of the document may take. */
function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
