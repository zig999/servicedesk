import type { Case } from './case.js';

/**
 * What read-case answers: the case whole, validated at this reading
 * (contracts/knowledge/case-query). No document hash accompanies it — a
 * case is pinned by slug and version alone, never by a digest over its
 * stored bytes (rules/investigation/replay-is-pinned, domain/investigation/
 * investigation) — so this shape carries nothing read-case's own caller
 * could mistake for such a pin.
 */
export type ReadCaseResult = {
  readonly case: Case;
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
   * read-case: answers the case at slug and version whole, validated at
   * this reading — every structural and coherence rule holds for it right
   * now; refuses with CaseNotFoundError where no such version is stored, or
   * with CaseNotValidError naming every violated rule together where any
   * rule fails at this reading.
   */
  readCase(slug: string, version: number): Promise<ReadCaseResult>;
}
