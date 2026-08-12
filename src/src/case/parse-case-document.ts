import { InvalidCaseDocumentError } from '../errors/invalid-case-document.error.js';
import {
  CONSOLIDATION_REGISTERS,
  type ConsolidationRegister,
} from '../investigation/consolidation-register.js';
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
 * to the coherence validation. The consolidation register is the one
 * exception to "every declared attribute required": it is optional, and,
 * where declared, closed to the two values the vocabulary admits rather
 * than glossary-checked, so this module's only import beyond its own types
 * and its typed error is that vocabulary's own plain type and value set
 * (domain/knowledge/consolidation-register), itself free of any import
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
    ...stringProblems(document['authored_at'], 'authored_at'),
    ...stringProblems(document['subject'], 'subject'),
    ...resolutionProblems(document['fallback'], 'the fallback'),
    ...consolidationRegisterProblems(document['consolidation_register']),
    ...hypothesesProblems(document['hypotheses']),
  ];
}

/**
 * How the case's optional consolidation register departs from its
 * declaration (domain/knowledge/case): never required, so a document
 * leaving it undeclared holds no problem here at all — the consolidation
 * step then keeps whatever register its own adapter defaults to — but a
 * document that does declare it must name one of the two closed values the
 * register admits, formal or plain
 * (domain/knowledge/consolidation-register).
 */
function consolidationRegisterProblems(value: unknown): string[] {
  if (value === undefined) {
    return [];
  }
  return isConsolidationRegister(value)
    ? []
    : ['consolidation_register is not one of formal, plain'];
}

/** Whether the given value is one of the two closed values the register admits. */
function isConsolidationRegister(value: unknown): value is ConsolidationRegister {
  return CONSOLIDATION_REGISTERS.some((register) => register === value);
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

/**
 * Whether one value is the integer a version or a hypothesis's declared
 * position must be — a guard, not an assertion (TYP-02), so version and
 * position both narrow through it rather than through a cast.
 */
function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

/** How a required integer attribute departs from its declaration: absent, or not an integer. */
function integerProblems(value: unknown, subject: string): string[] {
  if (value === undefined) {
    return [`${subject} is undeclared`];
  }
  return isInteger(value) ? [] : [`${subject} is not an integer`];
}

/** How the version departs from its declaration: the case declares it as an integer (domain/knowledge/case). */
function versionProblems(value: unknown): string[] {
  return integerProblems(value, 'version');
}

/**
 * How the document's hypotheses violate the structural rules: at least one
 * hypothesis declared (rules/knowledge/a-case-has-at-least-one-hypothesis),
 * each one complete, no name shared
 * (rules/knowledge/a-hypothesis-name-is-unique-within-its-case) and no
 * declared position shared
 * (rules/knowledge/a-hypothesis-position-is-unique-within-its-case).
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
    ...hypotheses.flatMap((hypothesis, index) => hypothesisProblems(hypothesis, locatorOf(index))),
    ...sharedNameProblems(hypotheses),
    ...sharedPositionProblems(hypotheses),
  ];
}

/**
 * How one hypothesis violates the structural rules: a name
 * (domain/knowledge/hypothesis), a declared integer position
 * (rules/knowledge/a-hypothesis-position-is-unique-within-its-case), a
 * non-empty criterion (rules/knowledge/a-hypothesis-declares-a-criterion),
 * at least one collected concept, and a complete resolution. `locator`
 * names which hypothesis a problem belongs to as a reader counts them
 * ("hypothesis 1"), never the declared `position` attribute itself.
 */
function hypothesisProblems(value: unknown, locator: string): string[] {
  if (!isRecord(value)) {
    return [`${locator} is not one JSON object`];
  }
  return [
    ...stringProblems(value['name'], `${locator}'s name`),
    ...integerProblems(value['position'], `${locator}'s position`),
    ...stringProblems(value['criterion'], `${locator}'s criterion`),
    ...collectsProblems(value['collects'], locator),
    ...resolutionProblems(value['resolution'], `${locator}'s resolution`),
  ];
}

/**
 * How one hypothesis's collects violates its declaration: at least one
 * concept, each entry naming one
 * (rules/knowledge/a-hypothesis-collects-at-least-one-concept).
 */
function collectsProblems(value: unknown, locator: string): string[] {
  if (value === undefined) {
    return [`${locator} collects no concept`];
  }
  if (!Array.isArray(value)) {
    return [`${locator}'s collects is not an array of concept names`];
  }
  const entries: readonly unknown[] = value;
  if (entries.length === 0) {
    return [`${locator} collects no concept`];
  }
  return entries.every((name) => typeof name === 'string' && name !== '')
    ? []
    : [`${locator}'s collects holds an entry that names no concept`];
}

/**
 * Every name more than one hypothesis declares, one problem per shared name
 * naming the locators that share it
 * (rules/knowledge/a-hypothesis-name-is-unique-within-its-case).
 */
function sharedNameProblems(hypotheses: readonly unknown[]): string[] {
  const locators = new Map<string, number[]>();
  for (const [index, hypothesis] of hypotheses.entries()) {
    const name = declaredName(hypothesis);
    if (name !== undefined) {
      locators.set(name, [...(locators.get(name) ?? []), index + 1]);
    }
  }
  return [...locators.entries()]
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

/**
 * Every position more than one hypothesis declares, one problem per shared
 * position naming the locators that share it
 * (rules/knowledge/a-hypothesis-position-is-unique-within-its-case) — the
 * same collect-every-shared-value-once shape sharedNameProblems above
 * already keeps for the name invariant.
 */
function sharedPositionProblems(hypotheses: readonly unknown[]): string[] {
  const locators = new Map<number, number[]>();
  for (const [index, hypothesis] of hypotheses.entries()) {
    const position = declaredPosition(hypothesis);
    if (position !== undefined) {
      locators.set(position, [...(locators.get(position) ?? []), index + 1]);
    }
  }
  return [...locators.entries()]
    .filter(([, at]) => at.length > 1)
    .map(([position, at]) => `hypotheses ${at.join(', ')} share the position ${position}`);
}

/** The position one hypothesis record declares, where it declares a valid integer one at all. */
function declaredPosition(hypothesis: unknown): number | undefined {
  if (!isRecord(hypothesis)) {
    return undefined;
  }
  const position = hypothesis['position'];
  return isInteger(position) ? position : undefined;
}

/** Names one hypothesis's locator as a reader counts them: the first hypothesis is hypothesis 1 — never the declared `position` attribute itself. */
function locatorOf(index: number): string {
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
 * and never keyed by name. The optional consolidation register travels
 * through exactly where the document declares it
 * (domain/knowledge/consolidation-register) and is left off the held case
 * entirely where the document leaves it undeclared, rather than carried as
 * an explicit undefined.
 */
function heldCase(document: Case): Case {
  return {
    slug: document.slug,
    title: document.title,
    when_to_use: document.when_to_use,
    version: document.version,
    authored_at: document.authored_at,
    subject: document.subject,
    fallback: heldResolution(document.fallback),
    ...(document.consolidation_register !== undefined
      ? { consolidation_register: document.consolidation_register }
      : {}),
    hypotheses: document.hypotheses.map(heldHypothesis),
  };
}

/** One hypothesis exactly as declared, its collects kept in the document's order. */
function heldHypothesis(hypothesis: Hypothesis): Hypothesis {
  return {
    name: hypothesis.name,
    position: hypothesis.position,
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
