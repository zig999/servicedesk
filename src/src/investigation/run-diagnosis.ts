// The composition root that runs one already-resolved, fresh investigation
// synchronously, end to end
// (task/diagnose-entry-point/diagnose-pipeline-composition): collection,
// judgment, resolve-and-narrow, drafting and persistence, wired exactly
// once, over a case, a subject and a narrative this call's own caller has
// already resolved (constraints/diagnosis-answers-synchronously) — this
// module never fetches or re-resolves the case itself, so the investigation
// it runs is exactly the case its caller already read and pinned by slug
// and version at the start of the request (contracts/investigation/case-source).
//
// Stages 1–4 (buildSubject, collectEvidence, judgeHypotheses, resolveAndNarrow,
// draftAssessment) no longer live here: they are extracted into
// investigation-pipeline.ts's own runInvestigationPipeline
// (task/case-simulation-pipeline/extract-shared-investigation-pipeline), so a
// future simulate composition can call exactly that function rather than
// this one re-deciding any one stage's own logic a second time. This module
// keeps only what is specific to diagnose's own composition: calling that
// shared function, then building and writing the Investigation
// (buildInvestigation, writeWithinDeadline) — the two steps a simulate
// composition never adds.
//
// Takes `now` and `deadline` as explicit parameters and never reads the
// system clock internally, the same discipline every stage it composes
// already keeps (constraints/the-deadline-is-an-absolute-propagated-instant):
// the same (now, deadline) pair given to this whole call is the one pair
// every stage-bound call is computed from inside runInvestigationPipeline,
// each intersected with its own nominal budget where one is declared
// (rules/investigation/an-answer-arrives-within-the-declared-deadline's own
// stage breakdown). Drafting (draft-assessment-text.ts) takes no deadline
// parameter at all and is called unbounded — an existing gap in that
// already-delivered module, not one this composition can close without
// widening past its own objective; see this delivery's own `deferred` entry.
//
// Persistence is the one stage rules/investigation/no-stage-aborts-on-its-deadline
// exempts from degrading: its write is raced against what remains of its own
// nominal budget, and a write that does not conclude in time raises
// InvestigationWriteDeadlineExceededError rather than ever answering an
// assessment with no record behind it
// (rules/investigation/the-response-follows-the-record,
// scenarios/investigation/no-response-without-a-record). The assessment this
// call answers is exactly the written investigation's own — never computed a
// second time — and only once that write has concluded
// (rules/investigation/an-investigation-is-written-once,
// rules/investigation/replay-is-pinned).
//
// The built Investigation's own written_at (buildInvestigationOptions below,
// task/case-and-investigation-model/investigation-record-shape) is stamped
// from this same propagated `now` rather than a second clock read, since
// nothing else instant-shaped reaches this composition and the one write
// that follows happens shortly after with no further stage in between.
//
// This same "response only after the write, an error rather than an
// assessment when it does not conclude in time" behavior is also what
// task/service-on-the-database/diagnose-end-to-end's own criteria 4 and 5
// hold this module to, once every dependency above is wired against the real
// database rather than a fake (task/service-on-the-database/store-wiring):
// that task adds no seam of its own for this, since createDiagnoseRunner
// (diagnose.factory.ts) already takes the shared DatabaseConnection as an
// ordinary parameter, the exact seam diagnose-e2e.spec.ts already uses to
// compose against a real connection outside createDiagnoseHttpServer's own
// internal one — reused, at the integration level, to prove criterion 5's
// deadline-exceeded branch against a real, deliberately slowed write.

import { InvestigationWriteDeadlineExceededError } from '../errors/investigation-write-deadline-exceeded.error.js';
import type { Assessment } from './assessment.js';
import { runInvestigationPipeline, type InvestigationPipelineOptions } from './investigation-pipeline.js';
import { buildInvestigation, type BuildInvestigationOptions } from './investigation-factory.js';
import type { IInvestigationStore } from './investigation-store.port.js';
import type { Investigation } from './investigation.js';
import type { Cost } from './cost.js';
import type { Durations } from './durations.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';

/**
 * Persistence's own nominal budget inside the declared total deadline
 * (rules/investigation/an-answer-arrives-within-the-declared-deadline's own
 * two-second slice) — the one stage
 * rules/investigation/no-stage-aborts-on-its-deadline exempts from
 * degrading, so its own overrun is an error rather than a recorded fact.
 */
const PERSISTENCE_STAGE_BUDGET_MS = 2_000;

/**
 * Answered by racePersist below once its bound elapses without the write
 * settling — never itself a domain outcome, only this module's own internal
 * marker, the same convention evidence-collection-stage.ts's own TIMED_OUT
 * already keeps for its own race.
 */
const WRITE_TIMED_OUT = Symbol('investigation-write-timeout');

/**
 * Everything runDiagnosis needs beyond what runInvestigationPipeline itself
 * already declares (investigation-pipeline.ts's own InvestigationPipelineOptions):
 * the fields buildInvestigation and the write step need — the investigation's
 * own id, the optional ticket reference, the narrative, which prompt version
 * and model were used, and the store the written investigation goes to.
 * glossary is no longer declared here of its own: it is inherited from
 * InvestigationPipelineOptions, which collectEvidence itself now also reads
 * through (task/evidence-semantics-snapshot/evidence-collection-snapshots-concept-and-field-semantics)
 * — the one instance this call's own caller supplies serves both
 * buildInvestigation's subject-attribute check and collectEvidence's
 * concept-description reads.
 */
export type RunDiagnosisOptions = InvestigationPipelineOptions & {
  readonly id: string;
  /**
   * Correlation with the ticketing system, never a matching key
   * (contracts/investigation/diagnosis's own "case, subject, narrative and
   * requester in, with an optional ticket reference") — optional because not
   * every diagnose call carries a ticket
   * (domain/investigation/investigation's own "requester is always given,
   * ticket_ref is not"). Passed straight through into
   * BuildInvestigationOptions below unchanged, including its absence
   * (task/case-and-investigation-model/ticket-ref-is-optional).
   */
  readonly ticket_ref?: string;
  readonly narrative: string;
  readonly prompt_version: string;
  readonly model: string;
  readonly store: IInvestigationStore;
};

/**
 * Runs one already-resolved, fresh investigation end to end
 * (task/diagnose-entry-point/diagnose-pipeline-composition): calls
 * investigation-pipeline.ts's own runInvestigationPipeline for stages 1–4
 * (buildSubject, collectEvidence, judgeHypotheses, resolveAndNarrow,
 * draftAssessment — task/case-simulation-pipeline/extract-shared-investigation-pipeline),
 * builds the whole Investigation from its answered record — the one factory
 * that can build a valid one, which re-validates the subject against the
 * glossary and the case's own totality requirements before anything is
 * constructed — writes it, racing that write against what remains of its
 * own nominal budget, and answers with the written investigation's own
 * assessment only once that write has concluded
 * (rules/investigation/the-response-follows-the-record,
 * scenarios/investigation/no-response-without-a-record).
 *
 * cost and durations are never computed here: runInvestigationPipeline
 * already accumulates both from every judged evaluation's own usage and the
 * one consolidation call's own usage/elapsed_ms, and from every concept's
 * and hypothesis's own already-measured elapsed_ms
 * (task/investigation-telemetry/diagnose-reports-real-cost-and-durations) —
 * this composition only carries the answered values through into
 * buildInvestigation, preserving this module's own "never reads the system
 * clock internally" (task/diagnose-entry-point/diagnose-pipeline-composition,
 * proved by run-diagnosis.spec.ts's own criterion 5).
 */
export async function runDiagnosis(options: RunDiagnosisOptions): Promise<Assessment> {
  const { evidence, evaluations, assessment, cost, durations } = await runInvestigationPipeline(options);
  const investigation = await buildInvestigation(
    buildInvestigationOptions({ options, evidence, evaluations, assessment, cost, durations }),
  );
  await writeWithinDeadline({ store: options.store, investigation, now: options.now, deadline: options.deadline });
  return investigation.assessment;
}

type BuildInvestigationArgs = {
  readonly options: RunDiagnosisOptions;
  readonly evidence: readonly Evidence[];
  readonly evaluations: readonly Evaluation[];
  readonly assessment: Assessment;
  /** This run's own accumulated cost, answered above by runInvestigationPipeline — never read from options, which no longer carries one (task/investigation-telemetry/diagnose-reports-real-cost-and-durations). */
  readonly cost: Cost;
  /** This run's own measured durations, answered above by runInvestigationPipeline — never read from options, for the same reason. */
  readonly durations: Durations;
};

/**
 * buildInvestigation's own options, assembled from this call's given options
 * and every completed stage's own output. written_at is derived from this
 * whole run's own `now` — the one instant already propagated into this
 * composition rather than a fresh clock read taken here
 * (this module's own "never reads the system clock internally"); the built
 * Investigation is a single immutable value with no later step to stamp a
 * closer instant onto it, so `now` is the nearest instant to the one write
 * that follows shortly after (task/case-and-investigation-model/investigation-record-shape).
 */
function buildInvestigationOptions(args: BuildInvestigationArgs): BuildInvestigationOptions {
  const { options, evidence, evaluations, assessment, cost, durations } = args;
  return {
    id: options.id,
    requester: options.requester,
    ticket_ref: options.ticket_ref,
    narrative: options.narrative,
    subjectType: options.subjectType,
    subjectAttributes: options.subjectAttributes,
    case: options.case,
    prompt_version: options.prompt_version,
    model: options.model,
    evidence,
    evaluations,
    assessment,
    cost,
    durations,
    written_at: new Date(options.now).toISOString(),
    glossary: options.glossary,
  };
}

type WriteWithinDeadlineArgs = {
  readonly store: IInvestigationStore;
  readonly investigation: Investigation;
  readonly now: number;
  readonly deadline: number;
};

/**
 * Writes the given investigation, never waiting past the minimum of
 * PERSISTENCE_STAGE_BUDGET_MS and what remains of the given (now, deadline)
 * pair — the one stage this composition never lets degrade silently
 * (rules/investigation/no-stage-aborts-on-its-deadline's own persistence
 * exception): a write that does not settle in time raises
 * InvestigationWriteDeadlineExceededError instead of ever answering an
 * assessment with no record behind it.
 */
async function writeWithinDeadline(args: WriteWithinDeadlineArgs): Promise<void> {
  const { store, investigation, now, deadline } = args;
  const boundMs = Math.min(PERSISTENCE_STAGE_BUDGET_MS, Math.max(0, deadline - now));
  const outcome = await racePersist(store.write(investigation), boundMs);
  if (outcome === WRITE_TIMED_OUT) {
    throw new InvestigationWriteDeadlineExceededError(investigation.id, boundMs);
  }
}

/**
 * Races one write() call against boundMs, answering WRITE_TIMED_OUT once
 * that bound elapses without it settling — the same race shape
 * evidence-collection-stage.ts's own raceObservation already keeps,
 * including letting a genuine rejection (e.g. InvestigationAlreadyStoredError)
 * propagate unmodified rather than being read as a timeout.
 */
function racePersist(write: Promise<void>, boundMs: number): Promise<void | typeof WRITE_TIMED_OUT> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(WRITE_TIMED_OUT), boundMs);
    write.then(
      () => {
        clearTimeout(timer);
        resolve(undefined);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
