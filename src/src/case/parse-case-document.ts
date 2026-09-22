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

const NO_HYPOTHESIS_PROBLEM = 'o caso não declara nenhuma hipótese';

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
    return ['o documento não é um objeto JSON'];
  }
  return [
    ...stringProblems(document['slug'], 'o slug'),
    ...stringProblems(document['title'], 'o título'),
    ...stringProblems(document['when_to_use'], 'a orientação de uso'),
    ...versionProblems(document['version']),
    ...stringProblems(document['authored_at'], 'a data de autoria'),
    ...stringProblems(document['subject'], 'o tipo de sujeito'),
    ...resolutionProblems(document['fallback'], 'a resolução padrão', 'da resolução padrão'),
    ...consolidationRegisterProblems(document['consolidation_register']),
    ...stateProblems(document['state']),
    ...optionalStringProblems(document['released_at'], 'a data de liberação'),
    ...manifestProblems(document['manifest']),
  ];
}

function consolidationRegisterProblems(value: unknown): string[] {
  if (value === undefined) {
    return [];
  }
  return isConsolidationRegister(value)
    ? []
    : ['o registro de consolidação não é um dos valores formal, plain'];
}

function isConsolidationRegister(value: unknown): value is ConsolidationRegister {
  return CONSOLIDATION_REGISTERS.some((register) => register === value);
}

function stateProblems(value: unknown): string[] {
  if (value === undefined) {
    return ['o estado está ausente'];
  }
  return isCaseVersionState(value) ? [] : ['o estado não é um dos valores rascunho, liberada'];
}

function isCaseVersionState(value: unknown): value is CaseVersionState {
  return CASE_VERSION_STATES.some((state) => state === value);
}

function stringProblems(value: unknown, subject: string): string[] {
  if (value === undefined) {
    return [`${subject} está ausente`];
  }
  if (typeof value !== 'string') {
    return [`${subject} não é um texto`];
  }
  return value === '' ? [`${subject} está em branco`] : [];
}

function optionalStringProblems(value: unknown, subject: string): string[] {
  if (value === undefined) {
    return [];
  }
  if (typeof value !== 'string') {
    return [`${subject} não é um texto`];
  }
  return value === '' ? [`${subject} está em branco`] : [];
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

function integerProblems(value: unknown, subject: string): string[] {
  if (value === undefined) {
    return [`${subject} está ausente`];
  }
  return isInteger(value) ? [] : [`${subject} não é um número inteiro`];
}

function versionProblems(value: unknown): string[] {
  return integerProblems(value, 'a versão');
}

function manifestProblems(value: unknown): string[] {
  if (value === undefined) {
    return [NO_HYPOTHESIS_PROBLEM];
  }
  if (!Array.isArray(value)) {
    return ['o manifesto não é uma lista de entradas'];
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
    return [`${locator} não é um objeto JSON`];
  }
  return [
    ...integerProblems(value['position'], `a posição da ${locator}`),
    ...stringProblems(value['hypothesis_name'], `a hipótese da ${locator}`),
    ...integerProblems(value['revision'], `a revisão da ${locator}`),
    ...stringProblems(value['criterion'], `o critério da ${locator}`),
    ...collectsProblems(value['collects'], locator),
    ...resolutionProblems(value['resolution'], `a resolução da ${locator}`, `da resolução da ${locator}`),
  ];
}

function collectsProblems(value: unknown, locator: string): string[] {
  if (value === undefined) {
    return [`${locator} não coleta nenhum conceito`];
  }
  if (!Array.isArray(value)) {
    return [`os conceitos coletados da ${locator} não formam uma lista de nomes de conceito`];
  }
  const entries: readonly unknown[] = value;
  if (entries.length === 0) {
    return [`${locator} não coleta nenhum conceito`];
  }
  return entries.every((name) => typeof name === 'string' && name !== '')
    ? []
    : [`os conceitos coletados da ${locator} incluem um item que não nomeia nenhum conceito`];
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
    .map(([name, at]) => `as entradas ${at.join(', ')} do manifesto compartilham a hipótese "${name}"`);
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
    .map(([position, at]) => `as entradas ${at.join(', ')} do manifesto compartilham a posição ${position}`);
}

function declaredPosition(entry: unknown): number | undefined {
  if (!isRecord(entry)) {
    return undefined;
  }
  const position = entry['position'];
  return isInteger(position) ? position : undefined;
}

function locatorOf(index: number): string {
  return `entrada ${index + 1} do manifesto`;
}

function resolutionProblems(value: unknown, nominative: string, genitive: string): string[] {
  if (value === undefined) {
    return [`${nominative} está ausente`];
  }
  if (!isRecord(value)) {
    return [`${nominative} não é um objeto JSON`];
  }
  return [
    ...stringProblems(value['outcome'], `o desfecho ${genitive}`),
    ...referralProblems(value['referral'], `o encaminhamento ${genitive}`, `do encaminhamento ${genitive}`),
  ];
}

function referralProblems(value: unknown, nominative: string, genitive: string): string[] {
  if (value === undefined) {
    return [`${nominative} está ausente`];
  }
  if (!isRecord(value)) {
    return [`${nominative} não é um objeto JSON`];
  }
  return [
    ...stringProblems(value['action'], `a ação ${genitive}`),
    ...stringProblems(value['recipient'], `o destinatário ${genitive}`),
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
