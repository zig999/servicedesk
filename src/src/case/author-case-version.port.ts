// The published author-case-version contract's own interface
// (contracts/knowledge/author-case-version): the curator's one entrance now
// that no file is the medium (contracts/system/case-authoring). A consumer
// depends on this interface, never on the case store, the glossary or the
// capability registry behind it.

/**
 * What author-case-version answers on a stored submission
 * (contracts/knowledge/author-case-version): the identity a curator revises
 * against next time — the slug and version this write stored, read back
 * from the case itself rather than invented here (domain/knowledge/case).
 */
export type AuthoredCaseVersion = {
  readonly slug: string;
  readonly version: number;
};

/**
 * The published author-case-version contract
 * (contracts/knowledge/author-case-version): submit one case version whole
 * and have every validator rule answer at this write, with all refusals
 * together, before anything is stored (contracts/system/case-authoring,
 * rules/knowledge/validation-runs-at-every-read). Written once is what
 * makes this a command rather than an edit: a submission naming a slug and
 * version already stored is refused rather than merged
 * (rules/knowledge/a-case-version-is-written-once), and revising a case
 * submits the next version.
 */
export interface IAuthorCaseVersion {
  /**
   * author-case-version: submits one case version whole, as its document —
   * unknown until every structural rule (parse-case-document.ts) and every
   * coherence rule (validate-case-coherence.ts) holds for it, both at this
   * one write. A submission violating any rule is refused once, naming
   * every violation together, and nothing is stored. A submission naming a
   * slug and version already stored is refused rather than merged. A
   * submission holding against every rule is stored, and this answers with
   * its slug and version.
   */
  authorCaseVersion(document: unknown): Promise<AuthoredCaseVersion>;
}
