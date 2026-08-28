// The published case-input-requirements contract
// (contracts/knowledge/case-input-requirements): its own read, kept as its
// own port rather than folded into ICaseQuery (case-query.port.ts) — a
// distinct published contract node, and one CaseQueryService
// (case-query.service.ts) answers both interfaces rather than a second,
// same-shaped service. Kept separate deliberately: widening ICaseQuery
// itself would force every existing stand-in already typed against it —
// across the query-side unit and route tests this task does not touch — to
// also satisfy this new method, which is exactly the widening this task must
// not do; a second, narrow interface confines that cost to the one new route
// that actually needs it.

import type { CaseInputRequirementsResult } from './case-input-requirements.js';

/**
 * The published case-input-requirements contract
 * (contracts/knowledge/case-input-requirements): the read a curator
 * composing a case version, and the entry point assembling a subject before
 * a diagnose, both need.
 */
export interface ICaseInputRequirementsQuery {
  /**
   * read-case-input-requirements: answers, for the named case version in
   * either state, its derived input requirements
   * (rules/knowledge/a-case-versions-input-requirements-are-derived) —
   * computed fresh from the currently registered capabilities on every call
   * (rules/knowledge/the-contract-check-reads-the-current-registration),
   * never stored or cached. Refuses the way read-case already refuses an
   * unstored or structurally invalid version (CaseNotFoundError,
   * CaseNotValidError); never runs read-case's own coherence check against
   * the glossary or the capability registry, since this read must still
   * answer for a draft that has not yet reached coherence
   * (this interface's own header comment).
   */
  readCaseInputRequirements(slug: string, version: number): Promise<CaseInputRequirementsResult>;
}
