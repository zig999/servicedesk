// The port through which a built investigation reaches its persistence
// (constraints/the-mvp-persists-to-no-database): one plain JSON document per
// investigation id, written exactly once and never mutated
// (rules/investigation/an-investigation-is-written-once). The investigation
// module declares this port and infrastructure implements it
// (constraints/the-domain-depends-on-no-infrastructure): no investigation
// module opens a file, and no framework, driver or client is imported here.

import type { Investigation } from './investigation.js';

/**
 * One stored investigation exactly as its file holds it: the document, raw
 * and unparsed, and the hash — the content identity of the document this
 * read found on disk, sha256 of its exact bytes, never a hash the
 * investigation itself might carry. This store neither parses nor
 * validates what a read answers, the same document/hash split
 * StoredCaseVersion draws for a case version (src/case/case-store.port.ts).
 */
export type StoredInvestigation = {
  readonly document: unknown;
  readonly hash: string;
};

/**
 * The port through which a built Investigation reaches its persistence: one
 * plain JSON document per investigation id, so a written investigation has
 * nowhere to be overwritten
 * (rules/investigation/an-investigation-is-written-once). write takes the
 * typed Investigation directly rather than an opaque document — unlike
 * ICaseStore's writeVersion, which stores a case document before any
 * validation of it exists, the only value this port's write ever receives
 * is the already-whole, already-valid aggregate the one factory that can
 * build it produces (investigation-factory.ts); there is no draft state to
 * widen the signature for. read still answers the stored document
 * opaquely, because this store, like the case store, parses and validates
 * nothing it reads back.
 */
export interface IInvestigationStore {
  /**
   * Persists one investigation as its own file, refusing rather than
   * overwriting where its identity is already stored
   * (rules/investigation/an-investigation-is-written-once). Refuses before
   * any write is attempted.
   */
  write(investigation: Investigation): Promise<void>;

  /**
   * Answers the stored investigation exactly as its file holds it, pinned
   * by the content identity of what this call read, or its absence stated
   * as data — an investigation never written is data, never a failure.
   */
  read(id: string): Promise<StoredInvestigation | undefined>;
}
