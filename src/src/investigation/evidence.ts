// The evidence value object as data (domain/investigation/evidence): what one
// collected concept returned, normalized to the glossary's vocabulary and
// identified within the investigation by its concept — an absence of data
// recorded as a fact (a non-ok result, domain/investigation/evidence-result),
// never as an exception. Assembled by the collection stage
// (task/evidence-collection/evidence-collection-stage) from the case's
// collection plan, the capability registry's read and the observation-source
// port's answer, since none of those three alone holds the whole record.

import type { EvidenceResult } from './evidence-result.js';

/**
 * The freshness tolerance a collected concept declares in the glossary
 * (domain/glossary/concept, rules/knowledge/a-collected-concept-declares-a-ttl),
 * in seconds — the unit the concept's own ttl is already decided in. This
 * stage has no reachable path to the concept's actual registered value (see
 * this module's own inference on why, recorded in the implementation record
 * rather than here), so every evidence this stage produces carries this
 * default uniformly, regardless of its result.
 */
export const DEFAULT_EVIDENCE_TTL_SECONDS = 60;

/**
 * One collected concept's whole record (domain/investigation/evidence):
 * every declared attribute, plus the capability reference the node's own
 * relationships section pins — which registered capability, at which
 * version, produced this observation, or would have, where one exists.
 * `capability_name`/`capability_version` carry that reference; both are the
 * empty string where no capability currently answers the concept, since the
 * relationship's declared cardinality of exactly one cannot be honored where
 * nothing was ever resolved to reference.
 */
export type Evidence = {
  readonly concept: string;
  /** The serialized call this stage actually made to observe the concept — concept, subject and requester together, pinned for replay as recorded bytes. */
  readonly inputs: string;
  /** The normalized observation, only where result is 'ok'; the empty string for every other ending, since only ok carries a usable observation. */
  readonly observation: string;
  /** When this stage resolved this evidence, as an ISO-8601 instant. */
  readonly observed_at: string;
  readonly ttl: number;
  /** Where the observation came from, for audit — the resolved capability's own connector, or the empty string where no capability was resolved. */
  readonly origin: string;
  readonly result: EvidenceResult;
  readonly result_detail?: string;
  readonly capability_name: string;
  readonly capability_version: string;
};
