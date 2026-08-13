// Composes the case document model with its two upstream published reads
// into the knowledge context's one published read
// (contracts/knowledge/case-query): every validator rule — structural and
// coherence alike — holds at the moment of reading, or the read refuses
// once with every violated rule named together
// (rules/knowledge/validation-runs-at-every-read,
// contracts/system/case-authoring). This module reaches every dependency
// through its published port alone — the case store, the glossary and the
// capability registry are never touched directly, and no framework, driver
// or client is imported here — so it stays testable against port fakes
// (constraints/the-domain-depends-on-no-infrastructure). replay-case is the
// declared exception to validation-runs-at-every-read in full: it answers
// the pinned version's exact stored content without running either the
// structural parse's own refusal or the coherence checks — reproducibility
// pins content, not current validity — and it resolves that content
// without reading any digest over it at all, since slug and version alone
// name one content (rules/investigation/replay-is-pinned). read-case alone
// runs that validation, at every one of its own readings.

import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { CaseNotFoundError } from '../errors/case-not-found.error.js';
import { CaseNotValidError } from '../errors/case-not-valid.error.js';
import { InvalidCaseDocumentError } from '../errors/invalid-case-document.error.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { CASE_DOCUMENT_ENDING, type Case } from './case.js';
import type { ICaseQuery, ReadCaseResult } from './case-query.port.js';
import type { ICaseStore, StoredCaseVersion } from './case-store.port.js';
import { parseCaseDocument } from './parse-case-document.js';
import { caseCoherenceViolations } from './validate-case-coherence.js';

/**
 * The published case-query contract's one implementation: composes the case
 * store with the two upstream published reads, so a consumer holding
 * ICaseQuery answers a validated case without depending on any of the three
 * or on how each is persisted.
 */
export class CaseQueryService implements ICaseQuery {
  public constructor(
    private readonly caseStore: ICaseStore,
    private readonly glossary: IGlossaryQuery,
    private readonly capabilities: ICapabilityQuery,
  ) {}

  /**
   * read-case: refuses once, naming every violated rule together, where the
   * version is unstored (CaseNotFoundError), where the stored document fails
   * a structural rule, or where the parsed case fails a coherence rule
   * against the glossary and the capability registry as they stand right
   * now (CaseNotValidError either way) — and otherwise answers the case
   * whole, validated as of this reading.
   */
  public async readCase(slug: string, version: number): Promise<ReadCaseResult> {
    const stored = await heldVersion(this.caseStore, slug, version);
    const theCase = structuralCase(stored.document, slug, version);
    await this.refuseIncoherence(theCase, version);
    return { case: theCase };
  }

  /** Refuses a coherence violation, naming every one together, joining the same error type the structural refusal raises. */
  private async refuseIncoherence(theCase: Case, version: number): Promise<void> {
    const violations = await caseCoherenceViolations(theCase, this.glossary, this.capabilities);
    if (violations.length > 0) {
      throw new CaseNotValidError(theCase.slug, version, violations);
    }
  }
}

/**
 * replay-case: answers the pinned version's exact stored content as the
 * case it already was, running neither the structural parse's own refusal
 * (parse-case-document.ts) nor the coherence checks against the glossary
 * or the capability registry — reproducibility pins content, not
 * current validity (rules/knowledge/validation-runs-at-every-read), so an
 * old investigation reads the exact version it pinned even where the
 * document would now fail a rule, or where either upstream context has
 * since moved on. Resolves without reading any digest over the case's
 * content at all: slug and version alone name one content, because a
 * version is written once and never altered
 * (rules/investigation/replay-is-pinned), so the store's own
 * content-identity hash on the version this call reads is never consulted
 * — read-case's own answer carries no such hash either, so neither
 * function's shape is pinned by anything but slug and version. Still
 * refuses a version nothing stored, through the same CaseNotFoundError
 * read-case raises.
 */
export async function replayCase(slug: string, version: number, caseStore: ICaseStore): Promise<Case> {
  const { document } = await heldVersion(caseStore, slug, version);
  return trustedCase(document);
}

/**
 * Reads a stored document as the case it already was, trusting its shape
 * rather than checking it — the one place this module departs from
 * TYP-02's guard-alongside-every-assertion convention, disclosed in this
 * task's own delivery record rather than silently. A guard thorough enough
 * to narrow `unknown` to `Case` here would have to test the same structural
 * facts parseCaseDocument's own refusal already tests — at least one
 * hypothesis, a resolution on every position, and the rest — which is
 * exactly the validation criterion 4 of this file's own task requires
 * replay to skip, so building one would re-open what this function exists
 * to close. A version is written once and never altered
 * (rules/knowledge/every-case-version-remains-readable), so the bytes this
 * call reads are the exact bytes an investigation once pinned, and trusting
 * their shape is what "without revalidation" means for replay.
 */
function trustedCase(document: unknown): Case {
  return document as Case;
}

/** Answers the stored version, refusing an unstored one through the typed not-found error read-case and replay-case share. */
async function heldVersion(store: ICaseStore, slug: string, version: number): Promise<StoredCaseVersion> {
  const stored = await store.readVersion(slug, version);
  if (stored === undefined) {
    throw new CaseNotFoundError(slug, version);
  }
  return stored;
}

/**
 * Parses the stored document for read-case, joining a structural refusal
 * into the one joint error type read-case promises
 * (contracts/system/case-authoring) — every violated structural rule named
 * together, exactly as InvalidCaseDocumentError already collected them.
 */
function structuralCase(document: unknown, slug: string, version: number): Case {
  try {
    return parseCaseDocument(document, `${slug}${CASE_DOCUMENT_ENDING}`);
  } catch (error) {
    if (error instanceof InvalidCaseDocumentError) {
      throw new CaseNotValidError(slug, version, error.context.problems);
    }
    throw error;
  }
}
