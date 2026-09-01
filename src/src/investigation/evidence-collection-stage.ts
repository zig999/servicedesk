import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import type { Capability } from '../capability-registry/capability.js';
import { collectionPlan } from '../case/case-resolution.js';
import type { Case } from '../case/case.js';
import { CapabilityNotResolvedForObservationError } from '../errors/capability-not-resolved-for-observation.error.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { DEFAULT_EVIDENCE_TTL_SECONDS, type Evidence } from './evidence.js';
import type { EvidenceResult } from './evidence-result.js';
import { fieldSemanticsOf, type FieldSemantics } from './field-semantics.js';
import type { IObservationSource, ObservationOutcome, Subject } from './observation-source.port.js';

export const COLLECTION_STAGE_BUDGET_MS = 7_000;

const TIMED_OUT = Symbol('evidence-collection-timeout');

export type CollectEvidenceOptions = {
  readonly case: Case;
  readonly subject: Subject;

  readonly requester: string;
  readonly capabilities: ICapabilityQuery;

  readonly glossary: IGlossaryQuery;
  readonly observationSource: IObservationSource;

  readonly now: number;

  readonly deadline: number;
};

export async function collectEvidence(options: CollectEvidenceOptions): Promise<readonly Evidence[]> {
  const { case: theCase, subject, requester, capabilities, glossary, observationSource, now, deadline } = options;
  const stageCeilingMs = Math.max(0, Math.min(COLLECTION_STAGE_BUDGET_MS, deadline - now));
  const concepts = collectionPlan(theCase);
  return Promise.all(
    concepts.map((concept) =>
      collectOneEvidence({ concept, subject, requester, capabilities, glossary, observationSource, stageCeilingMs, now }),
    ),
  );
}

type CollectOneEvidenceOptions = {
  readonly concept: string;
  readonly subject: Subject;
  readonly requester: string;
  readonly capabilities: ICapabilityQuery;
  readonly glossary: IGlossaryQuery;
  readonly observationSource: IObservationSource;
  readonly stageCeilingMs: number;
  readonly now: number;
};

async function collectOneEvidence(options: CollectOneEvidenceOptions): Promise<Evidence> {
  const { concept, subject, requester, capabilities, glossary, observationSource, stageCeilingMs, now } = options;
  const inputs = serializeInputs(concept, subject, requester);
  const observedAt = new Date(now).toISOString();
  const attemptStartedAt = Date.now();
  const [resolution, conceptDescription] = await Promise.all([
    capabilities.readCapability(concept),
    conceptDescriptionOf(glossary, concept),
  ]);
  if (!resolution.held) {
    return unavailableEvidence({ concept, inputs, observedAt, attemptStartedAt, conceptDescription });
  }
  const capability = resolution.capability;
  const base = resolvedBaseOf({ concept, inputs, observedAt, capability, conceptDescription });
  const effectiveBoundMs = effectiveBoundMsFor(capability, stageCeilingMs);
  const outcome = await raceObservation(
    observationSource.observeConcept({ concept, subject, requester, remainingBudgetMs: stageCeilingMs }),
    effectiveBoundMs,
  );
  return settledEvidence({ base, outcome, effectiveBoundMs, attemptStartedAt });
}

function resolvedBaseOf(args: {
  readonly concept: string;
  readonly inputs: string;
  readonly observedAt: string;
  readonly capability: Capability;
  readonly conceptDescription: string;
}): EvidenceBase {
  const { concept, inputs, observedAt, capability, conceptDescription } = args;
  return {
    concept,
    inputs,
    observedAt,
    origin: capability.connector,
    capabilityName: capability.name,
    capabilityVersion: capability.version,
    fields: fieldSemanticsOf(capability.output_schema),
    conceptDescription,
  };
}

function elapsedSince(attemptStartedAt: number): number {
  return Date.now() - attemptStartedAt;
}

async function conceptDescriptionOf(glossary: IGlossaryQuery, concept: string): Promise<string> {
  const resolution = await glossary.readConcept(concept);
  return resolution.held ? resolution.concept.description : '';
}

function serializeInputs(concept: string, subject: Subject, requester: string): string {
  return JSON.stringify({ concept, subject, requester });
}

function effectiveBoundMsFor(capability: Capability, stageCeilingMs: number): number {
  return Math.max(0, Math.min(capability.timeout, stageCeilingMs));
}

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

  readonly fields: readonly FieldSemantics[];

  readonly conceptDescription: string;
};

type EvidenceEnding = {
  readonly result: EvidenceResult;
  readonly observation?: string;
  readonly resultDetail?: string;

  readonly elapsedMs: number;
};

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
    elapsed_ms: ending.elapsedMs,
    fields: base.fields,
    concept_description: base.conceptDescription,
  };
}

function unavailableEvidence(options: UnavailableEvidenceOptions): Evidence {
  const { concept, inputs, observedAt, attemptStartedAt, conceptDescription } = options;
  return evidenceOf(
    { concept, inputs, observedAt, origin: '', capabilityName: '', capabilityVersion: '', fields: [], conceptDescription },
    {
      result: 'unavailable',
      resultDetail: new CapabilityNotResolvedForObservationError(concept).name,
      elapsedMs: elapsedSince(attemptStartedAt),
    },
  );
}

type UnavailableEvidenceOptions = {
  readonly concept: string;
  readonly inputs: string;
  readonly observedAt: string;
  readonly attemptStartedAt: number;
  readonly conceptDescription: string;
};

function settledEvidence(options: SettledEvidenceOptions): Evidence {
  const { base, outcome, effectiveBoundMs, attemptStartedAt } = options;
  const elapsedMs = elapsedSince(attemptStartedAt);
  if (outcome === TIMED_OUT) {
    return evidenceOf(base, { result: 'timeout', resultDetail: `no observation within ${effectiveBoundMs}ms`, elapsedMs });
  }
  if (outcome.result === 'ok') {
    return evidenceOf(base, { result: 'ok', observation: outcome.observation, elapsedMs });
  }
  if (outcome.result === 'unavailable') {
    return evidenceOf(base, { result: 'unavailable', resultDetail: outcome.result_detail, elapsedMs });
  }
  return evidenceOf(base, { result: outcome.result, elapsedMs });
}

type SettledEvidenceOptions = {
  readonly base: EvidenceBase;
  readonly outcome: ObservationOutcome | typeof TIMED_OUT;
  readonly effectiveBoundMs: number;
  readonly attemptStartedAt: number;
};
