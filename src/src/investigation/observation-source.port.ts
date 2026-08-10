// The port through which the collection stage observes one concept for one
// subject (contracts/investigation/observation-source), consuming the
// integration context's published observe-concept operation
// (contracts/integration/concept-observation) without depending on any
// connector, framework or driver
// (constraints/the-domain-depends-on-no-infrastructure). The investigation
// module declares this port; infrastructure implements it — a fake for
// testing today, and this epic's declared remainder for the real connector.

import type { EvidenceResult } from './evidence-result.js';
import type { Subject } from './subject.js';

/**
 * The one thing an observation examines: domain/investigation/subject's own
 * canonical shape (a subject type from the glossary plus its whole
 * attribute-value set), re-exported here rather than redeclared, so this
 * port's `subject` parameter and every module already importing `Subject`
 * from this file resolve to the one governed type
 * (task/subject-identity-rework/subject-value-object). This port previously
 * carried a structurally identical inline duplicate, left in place until the
 * canonical module existed; that duplicate is retired now that it does. Its
 * whole attribute-value set reaching every observe-concept call unfiltered
 * is task/subject-identity-rework/observation-source-subject-shape's own
 * objective, not this re-export's.
 */
export type { Subject };

/**
 * What one observe-concept call answers: the ending it reached
 * (domain/investigation/evidence-result), and, only where that ending is
 * ok, the observation itself, already normalized to the glossary's
 * vocabulary (contracts/integration/concept-observation,
 * constraints/evidence-normalization-is-an-anticorruption-layer) — the
 * type ties the two endings together with the same enumeration
 * evidence-result.ts declares, so a fifth ending added there is a fifth
 * ending here without this file changing. The other endings carry no
 * observation, being facts about the attempt rather than data
 * (domain/investigation/evidence-result), and none of the four is ever
 * thrown: an absence of data is a recorded fact, never an exception
 * (domain/investigation/evidence).
 */
export type ObservationOutcome =
  | { readonly result: 'ok'; readonly observation: string }
  | { readonly result: Exclude<EvidenceResult, 'ok'> };

/**
 * The published observation-source contract
 * (contracts/investigation/observation-source): the collection stage's one
 * call per concept in its plan, observing it for one subject within the
 * requester's own authorization scope — never the service's
 * (rules/investigation/collection-runs-in-the-requester-scope). The
 * requester is required on every call for exactly that reason: nothing in
 * this signature lets a caller omit it or substitute a service-wide
 * identity of its own. A consumer depends on this interface, never on a
 * connector.
 */
export interface IObservationSource {
  /**
   * observe-concept: observes one concept, by its glossary name, for one
   * subject, within the given requester's own scope, answering one of the
   * four evidence-result endings as data — never throwing for a non-ok
   * ending (domain/investigation/evidence,
   * domain/investigation/evidence-result).
   */
  observeConcept(concept: string, subject: Subject, requester: string): Promise<ObservationOutcome>;
}
