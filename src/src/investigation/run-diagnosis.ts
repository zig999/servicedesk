// The composition root that runs one already-resolved, fresh investigation
// synchronously, end to end
// (task/diagnose-entry-point/diagnose-pipeline-composition): collection,
// judgment, resolve-and-narrow, drafting and persistence, wired exactly
// once, over a case, a subject and a narrative this call's own caller has
// already resolved (constraints/diagnosis-answers-synchronously) — this
// module never fetches or re-resolves the case itself, so the investigation
// it runs is exactly the case its caller already read and pinned by content
// at the start of the request (contracts/investigation/case-source).
//
// Takes `now` and `deadline` as explicit parameters and never reads the
// system clock internally, the same discipline every stage it composes
// already keeps (constraints/the-deadline-is-an-absolute-propagated-instant):
// the same (now, deadline) pair given to this whole call is the one pair
// every stage-bound call below is computed from, each intersected with its
// own nominal budget where one is declared
// (rules/investigation/an-answer-arrives-within-the-declared-deadline's own
// stage breakdown) — collection intersects its own seven-second budget
// internally (evidence-collection-stage.ts's own COLLECTION_STAGE_BUDGET_MS);
// judgment and persistence have no such intersection of their own, so this
// module performs it on their behalf, the same way evidence-collection-stage.ts
// already performs it on its own. Drafting (draft-assessment-text.ts) takes
// no deadline parameter at all and is called unbounded — an existing gap in
// that already-delivered module, not one this composition can close without
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

import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import type { Case } from '../case/case.js';
import { InvestigationWriteDeadlineExceededError } from '../errors/investigation-write-deadline-exceeded.error.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { Assessment } from './assessment.js';
import type { IAssessmentConsolidator } from './assessment-consolidator.port.js';
import type { ConsolidationRegister } from './consolidation-register.js';
import type { Cost } from './cost.js';
import { draftAssessment } from './draft-assessment-text.js';
import type { Durations } from './durations.js';
import type { Evaluation } from './evaluation.js';
import { collectEvidence, type CollectEvidenceOptions } from './evidence-collection-stage.js';
import type { Evidence } from './evidence.js';
import type { IHypothesisEvaluator } from './hypothesis-evaluator.port.js';
import { buildInvestigation, type BuildInvestigationOptions } from './investigation-factory.js';
import type { IInvestigationStore } from './investigation-store.port.js';
import type { Investigation } from './investigation.js';
import { judgeHypotheses, type JudgeHypothesesOptions } from './judgment-stage.js';
import type { IObservationSource, Subject } from './observation-source.port.js';
import { resolveAndNarrow } from './resolve-and-narrow-input.js';
import { buildSubject } from './subject.js';
import type { SubjectAttributeValue } from './subject-attribute-value.js';

/**
 * Judgment's own nominal budget inside the declared total deadline
 * (rules/investigation/an-answer-arrives-within-the-declared-deadline's own
 * five-second slice). judgment-stage.ts owns no such constant itself — its
 * own module comment trusts whoever composes it to intersect the overall
 * deadline with this stage's own share before calling it, the same
 * intersection evidence-collection-stage.ts already performs on its own
 * behalf with COLLECTION_STAGE_BUDGET_MS.
 */
const JUDGMENT_STAGE_BUDGET_MS = 5_000;

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

export type RunDiagnosisOptions = {
  readonly id: string;
  readonly requester: string;
  readonly ticket_ref: string;
  readonly narrative: string;
  /** The subject's governed type, exactly as this call's own caller assembled it — raw, unvalidated input, the same convention BuildInvestigationOptions already keeps. */
  readonly subjectType: string;
  /** The subject's whole attribute-value set, exactly as this call's own caller assembled it — raw, unvalidated input. */
  readonly subjectAttributes: readonly SubjectAttributeValue[];
  /** The pinned case, already read and validated by this call's own caller — never fetched or re-resolved here (contracts/investigation/case-source). */
  readonly case: Case;
  readonly prompt_version: string;
  readonly model: string;
  /**
   * What this investigation cost at the provider, already accumulated by
   * this call's own caller: no port this composition calls
   * (IHypothesisEvaluator, IAssessmentConsolidator, IObservationSource)
   * reports a token count or a call count, so this arrives the same
   * already-given way model and prompt_version already do
   * (BuildInvestigationOptions' own convention).
   */
  readonly cost: Cost;
  /**
   * How long each stage took, already measured by this call's own caller —
   * this composition never reads the system clock, so it has no way to
   * measure it itself.
   */
  readonly durations: Durations;
  /**
   * The register to consolidate in where the pinned case leaves
   * consolidation_register undeclared (domain/knowledge/case's own "the
   * consolidation step keeps whatever register its own adapter defaults
   * to"): the published assessment-consolidator port always requires a
   * concrete formal-or-plain value, so this call's own caller supplies the
   * fallback rather than this module deciding one of its own.
   */
  readonly defaultConsolidationRegister: ConsolidationRegister;
  readonly glossary: IGlossaryQuery;
  readonly capabilities: ICapabilityQuery;
  readonly observationSource: IObservationSource;
  readonly evaluator: IHypothesisEvaluator;
  /** The configured pool bound judgeHypotheses judges under (constraints/hypotheses-are-judged-in-isolated-parallel-calls' own "the pool bound is configuration") — never a number this module invents. */
  readonly poolSize: number;
  readonly consolidator: IAssessmentConsolidator;
  readonly store: IInvestigationStore;
  /** The instant this whole run starts, as epoch milliseconds — read once by this call's own caller, never by this module. */
  readonly now: number;
  /** The absolute deadline instant propagated from the whole request, as epoch milliseconds (constraints/the-deadline-is-an-absolute-propagated-instant). */
  readonly deadline: number;
};

/**
 * Runs one already-resolved, fresh investigation end to end
 * (task/diagnose-entry-point/diagnose-pipeline-composition): assembles and
 * validates the subject once up front (subject.ts's own buildSubject, the
 * one place a subject's own at-least-one-attribute invariant is enforced,
 * reused here rather than re-decided), collects evidence, judges every
 * required hypothesis, resolves the outcome and drafts the assessment's
 * text, builds the whole Investigation — the one factory that can build a
 * valid one, which re-validates the subject against the glossary and the
 * case's own totality requirements before anything is constructed — writes
 * it, racing that write against what remains of its own nominal budget, and
 * answers with the written investigation's own assessment only once that
 * write has concluded (rules/investigation/the-response-follows-the-record,
 * scenarios/investigation/no-response-without-a-record).
 */
export async function runDiagnosis(options: RunDiagnosisOptions): Promise<Assessment> {
  const subject = buildSubject(options.subjectType, options.subjectAttributes);
  const evidence = await collectEvidence(collectEvidenceOptions(options, subject));
  const evidenceByHypothesis = evidenceByHypothesisOf(options.case, evidence);
  const evaluations = await judgeHypotheses(judgeHypothesesOptions(options, evidenceByHypothesis));
  const { resolved, narrowedInput } = resolveAndNarrow({ case: options.case, evaluations, evidenceByHypothesis });
  const assessment = await draftAssessment({
    resolved,
    narrowedInput,
    consolidationRegister: options.case.consolidation_register ?? options.defaultConsolidationRegister,
    consolidator: options.consolidator,
  });
  const investigation = await buildInvestigation(buildInvestigationOptions({ options, evidence, evaluations, assessment }));
  await writeWithinDeadline({ store: options.store, investigation, now: options.now, deadline: options.deadline });
  return investigation.assessment;
}

/** collectEvidence's own options, assembled from this call's given options and the subject already built above. */
function collectEvidenceOptions(options: RunDiagnosisOptions, subject: Subject): CollectEvidenceOptions {
  return {
    case: options.case,
    subject,
    requester: options.requester,
    capabilities: options.capabilities,
    observationSource: options.observationSource,
    now: options.now,
    deadline: options.deadline,
  };
}

/**
 * judgeHypotheses's own options: the same (now, deadline) pair given to this
 * whole run, its own deadline tightened to no more than
 * JUDGMENT_STAGE_BUDGET_MS beyond now — evidence-collection-stage.ts's own
 * COLLECTION_STAGE_BUDGET_MS intersection, mirrored here since
 * judgment-stage.ts performs no such intersection on its own behalf.
 */
function judgeHypothesesOptions(
  options: RunDiagnosisOptions,
  evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>,
): JudgeHypothesesOptions {
  return {
    case: options.case,
    evidenceByHypothesis,
    evaluator: options.evaluator,
    capabilities: options.capabilities,
    poolSize: options.poolSize,
    now: options.now,
    deadline: Math.min(options.deadline, options.now + JUDGMENT_STAGE_BUDGET_MS),
  };
}

/**
 * Every required hypothesis's own collected evidence, matched by concept to
 * that hypothesis's own collects — judgment-stage.ts's and
 * resolve-and-narrow-input.ts's own shared evidenceByHypothesis convention,
 * built here since neither stage reaches the other's output on its own and
 * this composition is the one place that holds both the case and
 * collectEvidence's own flat, by-concept result.
 */
function evidenceByHypothesisOf(theCase: Case, evidence: readonly Evidence[]): ReadonlyMap<string, readonly Evidence[]> {
  const byHypothesis = new Map<string, readonly Evidence[]>();
  for (const hypothesis of theCase.hypotheses) {
    byHypothesis.set(hypothesis.name, evidence.filter((item) => hypothesis.collects.includes(item.concept)));
  }
  return byHypothesis;
}

type BuildInvestigationArgs = {
  readonly options: RunDiagnosisOptions;
  readonly evidence: readonly Evidence[];
  readonly evaluations: readonly Evaluation[];
  readonly assessment: Assessment;
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
  const { options, evidence, evaluations, assessment } = args;
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
    cost: options.cost,
    durations: options.durations,
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
