// The port through which every version of every case reaches its
// persistence (constraints/the-mvp-persists-to-no-database,
// constraints/a-case-is-stored-as-one-json-document). The case module
// declares it and infrastructure implements it
// (constraints/the-domain-depends-on-no-infrastructure): no case module
// opens a file, and no framework, driver or client is imported here.

/**
 * One version of a case exactly as its file holds it: the document, raw and
 * unparsed, and the hash — the content identity of the document this read
 * found on disk, sha256 of its exact bytes, never a hash the document itself
 * might declare (constraints/a-case-is-stored-as-one-json-document —
 * pinning it is hashing one file). Structural and coherence validation are
 * no concern of this store; a caller holding the document decides whether it
 * is a Case.
 */
export type StoredCaseVersion = {
  readonly document: unknown;
  readonly hash: string;
};

/**
 * The port through which every version of every case reaches its
 * persistence: one plain JSON document per case version, addressed by slug
 * and version, so storing a new version never touches an earlier one's file
 * (rules/knowledge/every-case-version-remains-readable) and loading a case
 * is reading exactly one file
 * (constraints/a-case-is-stored-as-one-json-document). This port stores and
 * retrieves the document exactly as it arrives — it neither parses nor
 * validates it, and it names no "read-case" operation: composing this
 * store with structural and coherence validation into the knowledge
 * context's published read (contracts/knowledge/case-query) is a later
 * task's to build, never this port's.
 */
export interface ICaseStore {
  /** Persists one version of a case as its own file, never overwriting an earlier version's file. */
  writeVersion(slug: string, version: number, document: unknown): Promise<void>;

  /**
   * Answers one version of a case exactly as its file holds it, pinned by
   * the content identity of what this call read, or its absence stated as
   * data — an unwritten version is data, never a failure.
   */
  readVersion(slug: string, version: number): Promise<StoredCaseVersion | undefined>;

  /**
   * Answers every version number currently stored for a case, an absent
   * case reading as no versions — the index behind
   * rules/knowledge/every-case-version-remains-readable, kept as the set of
   * files themselves rather than as a second record of them.
   */
  listVersions(slug: string): Promise<readonly number[]>;
}
