// The published author-case-version command's own implementation
// (contracts/knowledge/author-case-version): the curator's one entrance now
// that no file is the medium (contracts/system/case-authoring). It composes
// the case store with the same two upstream published reads
// case-query.service.ts's own CaseQueryService already composes for reading
// — the glossary-query and capability-check contracts
// (contracts/knowledge/vocabulary-terms, contracts/knowledge/capability-check)
// — but reaches them for authoring rather than for reading: every structural
// rule is answered by calling parse-case-document.ts and every coherence
// rule by calling validate-case-coherence.ts's own caseCoherenceViolations,
// neither reimplemented here
// (rules/knowledge/validation-runs-at-every-read). writeVersion is the one
// and only call this service makes into persistence, and it is reached only
// once both validations have already held, so nothing is stored on either
// refusal.

import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { CaseNotValidError } from '../errors/case-not-valid.error.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { AuthoredCaseVersion, IAuthorCaseVersion } from './author-case-version.port.js';
import { CASE_DOCUMENT_ENDING, type Case } from './case.js';
import type { ICaseStore } from './case-store.port.js';
import { parseCaseDocument } from './parse-case-document.js';
import { caseCoherenceViolations } from './validate-case-coherence.js';

/**
 * The published author-case-version contract's one implementation: composes
 * the case store with the two upstream published reads, so a consumer
 * holding IAuthorCaseVersion submits a case version without depending on
 * any of the three or on how each is persisted.
 */
export class AuthorCaseVersionService implements IAuthorCaseVersion {
  public constructor(
    private readonly caseStore: ICaseStore,
    private readonly glossary: IGlossaryQuery,
    private readonly capabilities: ICapabilityQuery,
  ) {}

  /**
   * author-case-version: refuses once, naming every violated structural rule
   * together, where the document fails parse-case-document.ts's own checks
   * (criterion 3, delegated in full); refuses once, naming every violated
   * coherence rule together, where the parsed case fails
   * validate-case-coherence.ts's own checks against the glossary and the
   * capability registry as they stand right now (criteria 4 through 8,
   * delegated, criterion 9's joining followed the same way
   * case-query.service.ts's own refuseIncoherence already joins it for
   * read-case); and otherwise stores the case whole and answers with its
   * slug and version (criterion 1). Nothing is stored on either refusal
   * (criterion 10): writeVersion is reached only after both validations
   * have already held, and a slug and version already stored is refused
   * there rather than merged (criterion 2, raised by the store itself).
   */
  public async authorCaseVersion(document: unknown): Promise<AuthoredCaseVersion> {
    const theCase = parsedCase(document);
    await this.refuseIncoherence(theCase);
    await this.caseStore.writeVersion(theCase.slug, theCase.version, theCase);
    return { slug: theCase.slug, version: theCase.version };
  }

  /**
   * Refuses a coherence violation, naming every one together, joining the
   * same error type read-case's own refusal already uses
   * (contracts/system/case-authoring, criterion 9).
   */
  private async refuseIncoherence(theCase: Case): Promise<void> {
    const violations = await caseCoherenceViolations(theCase, this.glossary, this.capabilities);
    if (violations.length > 0) {
      throw new CaseNotValidError(theCase.slug, theCase.version, violations);
    }
  }
}

/**
 * Parses the submitted document into the case it declares, refusing once
 * with every structural violation named together where it does not
 * (criterion 3, delegated to parse-case-document.ts, called rather than
 * reimplemented). That module's own second parameter checks the declared
 * slug against a file name (rules/knowledge/the-slug-matches-the-file-name)
 * — a rule about the file-based medium this write does not have
 * ("no file is the medium", contracts/knowledge/author-case-version). The
 * document's own declared slug, read speculatively before any structural
 * check runs, stands in for that file name exactly the way
 * case-query.service.ts's own structuralCase already builds one from a
 * known slug: appended with the same document ending, so the one check
 * this write cannot otherwise satisfy compares the slug to itself and never
 * refuses on that ground, whatever the slug itself contains.
 */
function parsedCase(document: unknown): Case {
  return parseCaseDocument(document, `${declaredSlugOrEmpty(document)}${CASE_DOCUMENT_ENDING}`);
}

/**
 * The document's own declared slug, read before any structural guarantee
 * exists about it — never trusted as valid, only handed back to
 * parseCaseDocument's own file-name parameter as this write's one stand-in
 * for a file it does not have. A document that does not declare a valid
 * slug at all answers empty, which parseCaseDocument's own slug check never
 * flags anyway: it fires only once the slug is already a valid, non-empty
 * string, and by then the stand-in built from that same string always
 * equals it.
 */
function declaredSlugOrEmpty(document: unknown): string {
  if (typeof document !== 'object' || document === null || Array.isArray(document)) {
    return '';
  }
  const slug = (document as Readonly<Record<string, unknown>>)['slug'];
  return typeof slug === 'string' ? slug : '';
}
