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
// declared exception to validation-runs-at-every-read: it answers the
// pinned version's content without running the coherence checks at all, so
// an old reading survives the glossary or the registry moving on.

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
   * whole, pinned by the content identity of the exact document this call
   * read.
   */
  public async readCase(slug: string, version: number): Promise<ReadCaseResult> {
    const stored = await heldVersion(this.caseStore, slug, version);
    const theCase = structuralCase(stored.document, slug, version);
    await this.refuseIncoherence(theCase, version);
    return { case: theCase, hash: stored.hash };
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
 * replay-case: answers the pinned version's content without running the
 * coherence checks against the glossary or the capability registry —
 * reproducibility pins content, not current validity
 * (rules/knowledge/validation-runs-at-every-read) — so an old investigation
 * reads the exact version it pinned even where either upstream has since
 * moved on. Still refuses a version nothing stored, through the same
 * CaseNotFoundError read-case raises; a document whose stored bytes fail to
 * parse is left to InvalidCaseDocumentError rather than joined into
 * CaseNotValidError, since replay makes no promise about current validity
 * for that error to speak to — parsing here reconstructs the pinned
 * content, it does not revalidate it.
 */
export async function replayCase(
  slug: string,
  version: number,
  caseStore: ICaseStore,
): Promise<ReadCaseResult> {
  const stored = await heldVersion(caseStore, slug, version);
  const theCase = parseCaseDocument(stored.document, `${slug}${CASE_DOCUMENT_ENDING}`);
  return { case: theCase, hash: stored.hash };
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
