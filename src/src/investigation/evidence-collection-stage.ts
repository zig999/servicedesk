// The orchestration that turns a case's collection plan into one evidence
// record per concept (task/evidence-collection/evidence-collection-stage):
// resolves each concept's capability through the already-published registry
// read, then calls the observation-source port in parallel, each call raced
// against whichever of the stage's own seven-second budget or the
// propagated deadline's remaining time is smaller
// (rules/investigation/collection-has-its-own-budget-within-the-total,
// constraints/the-deadline-is-an-absolute-propagated-instant). Both `now`
// and `deadline` arrive as explicit parameters — this module never reads the
// system clock itself — so the whole race is exercised deterministically
// against fixture timings, the same discipline
// src/investigation/idempotency-resolution.ts already established for its
// own instant.

import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import type { Capability } from '../capability-registry/capability.js';
import { collectionPlan } from '../case/case-resolution.js';
import type { Case } from '../case/case.js';
import { DEFAULT_EVIDENCE_TTL_SECONDS, type Evidence } from './evidence.js';
import type { EvidenceResult } from './evidence-result.js';
import type { IObservationSource, ObservationOutcome, Subject } from './observation-source.port.js';

/** The collection stage's own nominal budget inside the declared total deadline, in milliseconds (rules/investigation/collection-has-its-own-budget-within-the-total). */
export const COLLECTION_STAGE_BUDGET_MS = 7_000;

/** Answered by the race below once its bound elapses without observe-concept settling — never itself an evidence-result ending, only this module's own internal marker for "waited long enough." */
const TIMED_OUT = Symbol('evidence-collection-timeout');

export type CollectEvidenceOptions = {
  readonly case: Case;
  readonly subject: Subject;
  /** The requester's own authorization scope, passed straight through to every observe-concept call, never substituted (rules/investigation/collection-runs-in-the-requester-scope). */
  readonly requester: string;
  readonly capabilities: ICapabilityQuery;
  readonly observationSource: IObservationSource;
  /** The instant this stage starts, as epoch milliseconds. */
  readonly now: number;
  /** The absolute deadline instant propagated from the whole request, as epoch milliseconds (constraints/the-deadline-is-an-absolute-propagated-instant). */
  readonly deadline: number;
};

/**
 * Collects one Evidence per concept in the case's collection plan, all in
 * parallel, within whichever of the stage's own seven-second budget or the
 * propagated deadline's remaining time is smaller
 * (rules/investigation/collection-has-its-own-budget-within-the-total,
 * rules/investigation/one-evidence-per-collected-concept). A concept whose
 * call has not resolved by its own effective bound is recorded as evidence
 * with result timeout, never awaited past that mark, and one slow or hung
 * call never blocks another concept's own settling
 * (rules/investigation/no-stage-aborts-on-its-deadline).
 */
export async function collectEvidence(options: CollectEvidenceOptions): Promise<readonly Evidence[]> {
  const { case: theCase, subject, requester, capabilities, observationSource, now, deadline } = options;
  const stageCeilingMs = Math.max(0, Math.min(COLLECTION_STAGE_BUDGET_MS, deadline - now));
  const concepts = collectionPlan(theCase);
  return Promise.all(
    concepts.map((concept) =>
      collectOneEvidence({ concept, subject, requester, capabilities, observationSource, stageCeilingMs, now }),
    ),
  );
}

type CollectOneEvidenceOptions = {
  readonly concept: string;
  readonly subject: Subject;
  readonly requester: string;
  readonly capabilities: ICapabilityQuery;
  readonly observationSource: IObservationSource;
  readonly stageCeilingMs: number;
  readonly now: number;
};

/**
 * Resolves one concept's evidence: reads its capability, then — only where
 * one is currently held — races observe-concept against the smaller of its
 * own declared timeout and the stage's own ceiling. A concept nothing
 * currently answers never reaches the race at all, since there is nothing
 * to call (domain/investigation/evidence, domain/investigation/evidence-result).
 */
async function collectOneEvidence(options: CollectOneEvidenceOptions): Promise<Evidence> {
  const { concept, subject, requester, capabilities, observationSource, stageCeilingMs, now } = options;
  const inputs = serializeInputs(concept, subject, requester);
  const observedAt = new Date(now).toISOString();
  const resolution = await capabilities.readCapability(concept);
  if (!resolution.held) {
    return unavailableEvidence(concept, inputs, observedAt);
  }
  const capability = resolution.capability;
  const base: EvidenceBase = {
    concept,
    inputs,
    observedAt,
    origin: capability.connector,
    capabilityName: capability.name,
    capabilityVersion: capability.version,
  };
  const effectiveBoundMs = effectiveBoundMsFor(capability, stageCeilingMs);
  // effectiveBoundMs is not yet threaded into observe-concept's own
  // remaining-budget bound — that propagation is
  // task/observation-endings-and-collection-budget/collection-stage-propagates-remaining-budget's
  // own objective, not this call site's.
  const outcome = await raceObservation(observationSource.observeConcept({ concept, subject, requester }), effectiveBoundMs);
  return settledEvidence(base, outcome, effectiveBoundMs);
}

/** The serialized call this stage actually made to observe the concept, pinned for replay as recorded bytes — concept, subject and requester together, exactly the three arguments observe-concept itself takes. */
function serializeInputs(concept: string, subject: Subject, requester: string): string {
  return JSON.stringify({ concept, subject, requester });
}

/** The bound one observe-concept call may not exceed: the smaller of the capability's own declared timeout and whatever the stage's own ceiling still allows, never negative (scenarios/investigation/a-slow-capability-yields-to-the-collection-budget). */
function effectiveBoundMsFor(capability: Capability, stageCeilingMs: number): number {
  return Math.max(0, Math.min(capability.timeout, stageCeilingMs));
}

/**
 * Answers TIMED_OUT once boundMs elapses without observation settling,
 * resolved with what observation itself answers otherwise — never waiting
 * on it past that mark, so one slow or hung capability call never blocks
 * another concept's own race. A genuine rejection (never one of the four
 * evidence-result endings, which observe-concept never throws for) still
 * propagates, since that is a fault this stage has no evidence-result
 * ending to represent.
 */
function raceObservation(
  observation: Promise<ObservationOutcome>,
  boundMs: number,
): Promise<ObservationOutcome | typeof TIMED_OUT> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(TIMED_OUT), boundMs);
    observation.then(
      (outcome) => {
        clearTimeout(timer);
        resolve(outcome);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

type EvidenceBase = {
  readonly concept: string;
  readonly inputs: string;
  readonly observedAt: string;
  readonly origin: string;
  readonly capabilityName: string;
  readonly capabilityVersion: string;
};

type EvidenceEnding = {
  readonly result: EvidenceResult;
  readonly observation?: string;
  readonly resultDetail?: string;
};

/** Assembles one Evidence from what this stage always knows about the concept plus one of the four evidence-result endings — the empty string for observation standing for the recorded absence of data itself where the ending is not ok (domain/investigation/evidence, domain/investigation/evidence-result). */
function evidenceOf(base: EvidenceBase, ending: EvidenceEnding): Evidence {
  return {
    concept: base.concept,
    inputs: base.inputs,
    observation: ending.observation ?? '',
    observed_at: base.observedAt,
    ttl: DEFAULT_EVIDENCE_TTL_SECONDS,
    origin: base.origin,
    result: ending.result,
    result_detail: ending.resultDetail,
    capability_name: base.capabilityName,
    capability_version: base.capabilityVersion,
  };
}

/** The evidence this stage records for a concept nothing currently answers: 'unavailable' — the closest of the four evidence-result endings to "no capability was ever reached," since none of the other three presuppose a capability that exists to time out, be denied by or answer ok. */
function unavailableEvidence(concept: string, inputs: string, observedAt: string): Evidence {
  return evidenceOf(
    { concept, inputs, observedAt, origin: '', capabilityName: '', capabilityVersion: '' },
    { result: 'unavailable', resultDetail: `no capability is currently registered for concept "${concept}"` },
  );
}

/** Turns what the race answered — a timeout mark, or one of observe-concept's own four endings — into this concept's Evidence, never treating a non-ok ending as a thrown failure that aborts the stage (rules/investigation/no-stage-aborts-on-its-deadline, scenarios/investigation/a-collection-timeout-degrades-to-no-data). */
function settledEvidence(
  base: EvidenceBase,
  outcome: ObservationOutcome | typeof TIMED_OUT,
  effectiveBoundMs: number,
): Evidence {
  if (outcome === TIMED_OUT) {
    return evidenceOf(base, { result: 'timeout', resultDetail: `no observation within ${effectiveBoundMs}ms` });
  }
  if (outcome.result === 'ok') {
    return evidenceOf(base, { result: 'ok', observation: outcome.observation });
  }
  return evidenceOf(base, { result: outcome.result });
}
