import { InvalidCaseDocumentError } from '../errors/invalid-case-document.error.js';
import {
  CONSOLIDATION_REGISTERS,
  type ConsolidationRegister,
} from '../investigation/consolidation-register.js';
import {
  CASE_VERSION_STATES,
  type Case,
  type CaseVersionState,
  type Hypothesis,
  type HypothesisRevision,
  type ManifestEntry,
  type Resolution,
} from './case.js';

/** The refusal a case declaring no hypothesis is named with (rules/knowledge/a-case-has-at-least-one-hypothesis). */
const NO_HYPOTHESIS_PROBLEM = 'the case declares no hypothesis';

/**
 * The raw shape one case-version JSON document declares once every
 * structural rule below holds: a manifest entry's own adopted
 * hypothesis-revision content flattened onto the entry itself
 * (hypothesis_name, revision, criterion, collects, resolution) — the same
 * flattening convention case-store.port.ts's own HypothesisRevisionContent
 * already keeps for the same fact (MNT-03) — reshaped into the aggregate's
 * own nested ManifestEntry/HypothesisRevision/HypothesisIdentity types by
 * heldCase below, never asserted to already be that shape: refuseStructuralViolations
 * only ever asserts a document is this flatter shape, so heldCase is the one
 * place the two-distinct-types split this task's own criterion 1 requires is
 * actually built.
 */
type ManifestEntryDocument = {
  readonly position: number;
  readonly hypothesis_name: string;
  readonly revision: number;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

/** The whole raw document shape parseCaseDocument accepts, once every structural rule below holds. */
type CaseDocument = {
  readonly slug: string;
  readonly title: string;
  readonly when_to_use: string;
  readonly version: number;
  readonly authored_at: string;
  readonly subject: string;
  readonly fallback: Resolution;
  readonly consolidation_register?: ConsolidationRegister;
  readonly state: CaseVersionState;
  readonly released_at?: string;
  readonly manifest: readonly ManifestEntryDocument[];
};

/**
 * Parses one case-version document into the whole aggregate — the manifest,
 * its own hypothesis-revisions and their resolutions and referrals, all read
 * from the one document. The document arrives as its parsed data plus the
 * case's own already-known slug, used only to identify it in a refusal; a
 * document violating any structural rule is refused once, with every
 * violation named, and no missing part is ever defaulted or coerced. What
 * the structural rules do not decide — a term existing in the glossary, a
 * concept's capability — is no concern of this parse: those checks read
 * other contexts and belong to the coherence validation. The consolidation
 * register is the one exception to "every declared attribute required": it
 * is optional, and, where declared, closed to the two values the vocabulary
 * admits rather than glossary-checked, so this module's only import beyond
 * its own types and its typed error is that vocabulary's own plain type and
 * value set (domain/knowledge/consolidation-register), itself free of any
 * import (constraints/the-domain-depends-on-no-infrastructure).
 */
export function parseCaseDocument(document: unknown, slug: string): Case {
  refuseStructuralViolations(document, slug);
  return heldCase(document);
}

/**
 * Refuses a document violating any structural rule, once, with every
 * violation named (domain/knowledge/case-version) — the checks below are the
 * whole of what this assertion claims.
 */
function refuseStructuralViolations(document: unknown, slug: string): asserts document is CaseDocument {
  const problems = documentProblems(document);
  if (problems.length > 0) {
    throw new InvalidCaseDocumentError(slug, problems);
  }
}

/** Every way one document violates the structural rules, collected in one pass. */
function documentProblems(document: unknown): string[] {
  if (!isRecord(document)) {
    return ['the document is not one JSON object'];
  }
  return [
    ...stringProblems(document['slug'], 'slug'),
    ...stringProblems(document['title'], 'title'),
    ...stringProblems(document['when_to_use'], 'when_to_use'),
    ...versionProblems(document['version']),
    ...stringProblems(document['authored_at'], 'authored_at'),
    ...stringProblems(document['subject'], 'subject'),
    ...resolutionProblems(document['fallback'], 'the fallback'),
    ...consolidationRegisterProblems(document['consolidation_register']),
    ...stateProblems(document['state']),
    ...optionalStringProblems(document['released_at'], 'released_at'),
    ...manifestProblems(document['manifest']),
  ];
}

/**
 * How the case's optional consolidation register departs from its
 * declaration (domain/knowledge/case-version): never required, so a document
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
 * How the case version's state departs from its declaration
 * (domain/knowledge/case-version-state): required, and closed to the two
 * values the enumeration admits.
 */
function stateProblems(value: unknown): string[] {
  if (value === undefined) {
    return ['state is undeclared'];
  }
  return isCaseVersionState(value) ? [] : ['state is not one of draft, released'];
}

/** Whether the given value is one of the two closed values domain/knowledge/case-version-state admits. */
function isCaseVersionState(value: unknown): value is CaseVersionState {
  return CASE_VERSION_STATES.some((state) => state === value);
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
 * How one optional string attribute departs from its declaration — absent is
 * never a problem here, unlike stringProblems above: released_at is present
 * only once released (domain/knowledge/case-version), and this module adds
 * no refusal pairing its presence to state, since that fact is not among
 * this task's own criteria and no document this parse ever authors one
 * itself (this delivery's own inferences).
 */
function optionalStringProblems(value: unknown, subject: string): string[] {
  if (value === undefined) {
    return [];
  }
  if (typeof value !== 'string') {
    return [`${subject} is not a string`];
  }
  return value === '' ? [`${subject} is empty`] : [];
}

/**
 * Whether one value is the integer a version, a manifest entry's declared
 * position, or a hypothesis-revision's declared revision must be — a guard,
 * not an assertion (TYP-02), so every one of them narrows through it rather
 * than through a cast.
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

/** How the version departs from its declaration: the case declares it as an integer (domain/knowledge/case-version). */
function versionProblems(value: unknown): string[] {
  return integerProblems(value, 'version');
}

/**
 * How the document's manifest violates the structural rules
 * (domain/knowledge/case-version, domain/knowledge/manifest-entry): at least
 * one entry declared (rules/knowledge/a-case-has-at-least-one-hypothesis),
 * each one complete, no hypothesis shared and no declared position shared.
 */
function manifestProblems(value: unknown): string[] {
  if (value === undefined) {
    return [NO_HYPOTHESIS_PROBLEM];
  }
  if (!Array.isArray(value)) {
    return ['manifest is not an array of manifest entries'];
  }
  const entries: readonly unknown[] = value;
  if (entries.length === 0) {
    return [NO_HYPOTHESIS_PROBLEM];
  }
  return [
    ...entries.flatMap((entry, index) => manifestEntryProblems(entry, locatorOf(index))),
    ...sharedHypothesisProblems(entries),
    ...sharedPositionProblems(entries),
  ];
}

/**
 * How one manifest entry violates the structural rules: a declared integer
 * position (domain/knowledge/manifest-entry), and its one adopted
 * hypothesis-revision's own facts — the hypothesis it names, its declared
 * integer revision, a non-empty criterion
 * (rules/knowledge/a-hypothesis-declares-a-criterion), at least one
 * collected concept (rules/knowledge/a-hypothesis-collects-at-least-one-concept)
 * and a complete resolution. `locator` names which manifest entry a problem
 * belongs to as a reader counts them ("manifest entry 1"), never the
 * declared `position` attribute itself.
 */
function manifestEntryProblems(value: unknown, locator: string): string[] {
  if (!isRecord(value)) {
    return [`${locator} is not one JSON object`];
  }
  return [
    ...integerProblems(value['position'], `${locator}'s position`),
    ...stringProblems(value['hypothesis_name'], `${locator}'s hypothesis`),
    ...integerProblems(value['revision'], `${locator}'s revision`),
    ...stringProblems(value['criterion'], `${locator}'s criterion`),
    ...collectsProblems(value['collects'], locator),
    ...resolutionProblems(value['resolution'], `${locator}'s resolution`),
  ];
}

/**
 * How one manifest entry's adopted hypothesis-revision's collects violates
 * its declaration: at least one concept, each entry naming one
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
 * Every hypothesis more than one manifest entry names, one problem per
 * shared hypothesis naming the locators that share it — a manifest entry
 * adopting the same hypothesis twice, at two positions, is preserved from
 * this module's own prior behavior over the flat hypotheses array (this
 * delivery's own `preserved`).
 */
function sharedHypothesisProblems(entries: readonly unknown[]): string[] {
  const locators = new Map<string, number[]>();
  for (const [index, entry] of entries.entries()) {
    const name = declaredHypothesisName(entry);
    if (name !== undefined) {
      locators.set(name, [...(locators.get(name) ?? []), index + 1]);
    }
  }
  return [...locators.entries()]
    .filter(([, at]) => at.length > 1)
    .map(([name, at]) => `manifest entries ${at.join(', ')} share the hypothesis "${name}"`);
}

/** The hypothesis name one manifest entry record declares, where it declares one at all. */
function declaredHypothesisName(entry: unknown): string | undefined {
  if (!isRecord(entry)) {
    return undefined;
  }
  const name = entry['hypothesis_name'];
  return typeof name === 'string' && name !== '' ? name : undefined;
}

/**
 * Every position more than one manifest entry declares, one problem per
 * shared position naming the locators that share it
 * (domain/knowledge/manifest-entry) — preserved from this module's own prior
 * behavior over the flat hypotheses array (this delivery's own `preserved`).
 */
function sharedPositionProblems(entries: readonly unknown[]): string[] {
  const locators = new Map<number, number[]>();
  for (const [index, entry] of entries.entries()) {
    const position = declaredPosition(entry);
    if (position !== undefined) {
      locators.set(position, [...(locators.get(position) ?? []), index + 1]);
    }
  }
  return [...locators.entries()]
    .filter(([, at]) => at.length > 1)
    .map(([position, at]) => `manifest entries ${at.join(', ')} share the position ${position}`);
}

/** The position one manifest entry record declares, where it declares a valid integer one at all. */
function declaredPosition(entry: unknown): number | undefined {
  if (!isRecord(entry)) {
    return undefined;
  }
  const position = entry['position'];
  return isInteger(position) ? position : undefined;
}

/** Names one manifest entry's locator as a reader counts them: the first entry is manifest entry 1 — never the declared `position` attribute itself. */
function locatorOf(index: number): string {
  return `manifest entry ${index + 1}`;
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
 * attributes, so nothing undeclared travels in, the manifest reshaped into
 * this aggregate's own nested ManifestEntry/HypothesisRevision/HypothesisIdentity
 * types (domain/knowledge/manifest-entry, domain/knowledge/hypothesis-revision,
 * domain/knowledge/hypothesis — this task's own criterion 1 and criterion 2),
 * in the document's own array order — never reordered and never keyed by
 * name. The precedence collection-plan and resolve-outcome consult is each
 * manifest entry's own declared position instead of that array arrangement
 * (rules/knowledge/hypotheses-are-ordered-by-precedence,
 * task/case-and-investigation-model/precedence-from-position). hypotheses is
 * the same manifest, flattened for this aggregate's own out-of-scope
 * consumers (case.ts's own header comment) — derived here, never
 * independently read off the document. The optional consolidation register
 * and released_at travel through exactly where the document declares them
 * and are left off the held case entirely where the document leaves them
 * undeclared, rather than carried as an explicit undefined.
 */
function heldCase(document: CaseDocument): Case {
  const manifest = document.manifest.map(heldManifestEntry);
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
    state: document.state,
    ...(document.released_at !== undefined ? { released_at: document.released_at } : {}),
    manifest,
    hypotheses: manifest.map(flatHypothesisOf),
  };
}

/** One manifest entry exactly as declared, its own adopted hypothesis-revision nested rather than inlined (domain/knowledge/manifest-entry). */
function heldManifestEntry(entry: ManifestEntryDocument): ManifestEntry {
  return { position: entry.position, hypothesis_revision: heldHypothesisRevision(entry) };
}

/** One hypothesis-revision exactly as declared, referencing the hypothesis it belongs to by its own identity (domain/knowledge/hypothesis-revision, domain/knowledge/hypothesis). */
function heldHypothesisRevision(entry: ManifestEntryDocument): HypothesisRevision {
  return {
    hypothesis: { name: entry.hypothesis_name },
    revision: entry.revision,
    criterion: entry.criterion,
    collects: [...entry.collects],
    resolution: heldResolution(entry.resolution),
  };
}

/** One manifest entry's own adopted hypothesis-revision, flattened into the shape this aggregate's own out-of-scope consumers already read (case.ts's own Hypothesis, its own header comment). */
function flatHypothesisOf(entry: ManifestEntry): Hypothesis {
  const revision = entry.hypothesis_revision;
  return {
    name: revision.hypothesis.name,
    criterion: revision.criterion,
    collects: revision.collects,
    resolution: revision.resolution,
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
