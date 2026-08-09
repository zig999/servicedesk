import type { Case } from './case.js';

/**
 * What read-case and replay-case both answer: the case whole, pinned by the
 * content identity of the exact document the read found on disk
 * (constraints/a-case-is-stored-as-one-json-document — pinning it is
 * hashing one file).
 */
export type ReadCaseResult = {
  readonly case: Case;
  readonly hash: string;
};

/**
 * The published case-query contract (contracts/knowledge/case-query): the
 * synchronous read the knowledge context offers, one operation — read-case —
 * a case by slug and version, validated whole at the moment of this reading
 * and refused otherwise with every violated rule named at once
 * (rules/knowledge/validation-runs-at-every-read,
 * contracts/system/case-authoring). A consumer depends on this interface,
 * never on the case store, the glossary or the capability registry behind
 * it.
 */
export interface ICaseQuery {
  /**
   * read-case: answers the case at slug and version whole and pinned by
   * content where every structural and coherence rule holds for it right
   * now; refuses with CaseNotFoundError where no such version is stored, or
   * with CaseNotValidError naming every violated rule together where any
   * rule fails at this reading.
   */
  readCase(slug: string, version: number): Promise<ReadCaseResult>;
}
