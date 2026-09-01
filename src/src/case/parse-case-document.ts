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

const NO_HYPOTHESIS_PROBLEM = 'the case declares no hypothesis';

type ManifestEntryDocument = {
  readonly position: number;
  readonly hypothesis_name: string;
  readonly revision: number;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

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

export function parseCaseDocument(document: unknown, slug: string): Case {
  refuseStructuralViolations(document, slug);
  return heldCase(document);
}

function refuseStructuralViolations(document: unknown, slug: string): asserts document is CaseDocument {
  const problems = documentProblems(document);
  if (problems.length > 0) {
    throw new InvalidCaseDocumentError(slug, problems);
  }
}

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

function consolidationRegisterProblems(value: unknown): string[] {
  if (value === undefined) {
    return [];
  }
  return isConsolidationRegister(value)
    ? []
    : ['consolidation_register is not one of formal, plain'];
}

function isConsolidationRegister(value: unknown): value is ConsolidationRegister {
  return CONSOLIDATION_REGISTERS.some((register) => register === value);
}

function stateProblems(value: unknown): string[] {
  if (value === undefined) {
    return ['state is undeclared'];
  }
  return isCaseVersionState(value) ? [] : ['state is not one of draft, released'];
}

function isCaseVersionState(value: unknown): value is CaseVersionState {
  return CASE_VERSION_STATES.some((state) => state === value);
}

function stringProblems(value: unknown, subject: string): string[] {
  if (value === undefined) {
    return [`${subject} is undeclared`];
  }
  if (typeof value !== 'string') {
    return [`${subject} is not a string`];
  }
  return value === '' ? [`${subject} is empty`] : [];
}

function optionalStringProblems(value: unknown, subject: string): string[] {
  if (value === undefined) {
    return [];
  }
  if (typeof value !== 'string') {
    return [`${subject} is not a string`];
  }
  return value === '' ? [`${subject} is empty`] : [];
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

function integerProblems(value: unknown, subject: string): string[] {
  if (value === undefined) {
    return [`${subject} is undeclared`];
  }
  return isInteger(value) ? [] : [`${subject} is not an integer`];
}

function versionProblems(value: unknown): string[] {
  return integerProblems(value, 'version');
}

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

function declaredHypothesisName(entry: unknown): string | undefined {
  if (!isRecord(entry)) {
    return undefined;
  }
  const name = entry['hypothesis_name'];
  return typeof name === 'string' && name !== '' ? name : undefined;
}

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

function declaredPosition(entry: unknown): number | undefined {
  if (!isRecord(entry)) {
    return undefined;
  }
  const position = entry['position'];
  return isInteger(position) ? position : undefined;
}

function locatorOf(index: number): string {
  return `manifest entry ${index + 1}`;
}

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

function heldManifestEntry(entry: ManifestEntryDocument): ManifestEntry {
  return { position: entry.position, hypothesis_revision: heldHypothesisRevision(entry) };
}

function heldHypothesisRevision(entry: ManifestEntryDocument): HypothesisRevision {
  return {
    hypothesis: { name: entry.hypothesis_name },
    revision: entry.revision,
    criterion: entry.criterion,
    collects: [...entry.collects],
    resolution: heldResolution(entry.resolution),
  };
}

function flatHypothesisOf(entry: ManifestEntry): Hypothesis {
  const revision = entry.hypothesis_revision;
  return {
    name: revision.hypothesis.name,
    criterion: revision.criterion,
    collects: revision.collects,
    resolution: revision.resolution,
  };
}

function heldResolution(resolution: Resolution): Resolution {
  return {
    outcome: resolution.outcome,
    referral: {
      action: resolution.referral.action,
      recipient: resolution.referral.recipient,
    },
  };
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
