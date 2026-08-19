// The orchestration that turns a pinned case's required hypotheses and their
// own evidence into exactly one Evaluation each
// (task/hypothesis-judgment/judgment-stage): a hypothesis whose evidence is
// not all ok degrades immediately to no-data, never touching the pool; one
// otherwise judged in its own isolated evaluate() call, under a configured
// pool bound (constraints/hypotheses-are-judged-in-isolated-parallel-calls);
// a decided answer's citations are checked with citation-validation's own
// isCitationValid/acceptedCitations and, failing that, retried exactly once
// where the deadline still admits it, falling back to inconclusive with
// reason judgment-failure otherwise
// (scenarios/investigation/a-foreign-citation-is-refused); and a hypothesis
// denied a slot, or whose call (first or retry) has not settled by the
// stage's own absolute deadline, is inconclusive with reason
// deadline-exceeded, never no-data or judgment-failure
// (scenarios/investigation/a-queued-judgment-is-deadline-exceeded,
// rules/investigation/no-stage-aborts-on-its-deadline). The pinned case
// version's own CaseContext — its title and when_to_use — is computed once
// from the case version this call was given and travels unchanged into
// every evaluate() call and retry this stage makes, the same as any other
// hypothesis's own criterion and evidence
// (constraints/the-judgment-prompt-is-closed).
// `now` and `deadline`
// arrive as explicit parameters, never a system clock read internally, the
// same discipline evidence-collection-stage.ts and idempotency-lease-store.ts
// already established for their own instants
// (constraints/the-deadline-is-an-absolute-propagated-instant) — but unlike
// evidence-collection-stage.ts's own raceObservation, which starts a fresh
// per-call timer because every one of its calls starts in the very same
// tick, this stage's calls start at whatever moment a pool slot frees, so
// one shared deadline signal, timed once from this call's own `now`, is
// raced by every pool-slot wait and every evaluate() call and retry alike —
// the only way to honor one absolute instant without re-reading a clock this
// module never holds.

import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { requiresEvaluationOf } from '../case/case-resolution.js';
import type { Case, Hypothesis } from '../case/case.js';
import type { Citation } from './citation.js';
import { acceptedCitations, capabilityOutputSchemaKey, declaredFieldsOf, type CapabilityOutputSchemas, type HypothesisCitationContext } from './citation-validation.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { CaseContext, EvaluationOutcome, EvidenceItem, IHypothesisEvaluator } from './hypothesis-evaluator.port.js';

/** Answered by the shared deadline signal once this call's own ceiling elapses — never itself a domain outcome, only this module's internal "time is up" marker. */
const DEADLINE_ELAPSED = Symbol('judgment-stage-deadline-elapsed');
type DeadlineMarker = typeof DEADLINE_ELAPSED;

export type JudgeHypothesesOptions = {
  readonly case: Case;
  /** Per required hypothesis name, its own Evidence[] — already matched by concept to that hypothesis's own collects by whoever composes this stage with evidence-collection-stage's own output (this task's own scope reads only required hypotheses and their evidence, never the collection stage itself). */
  readonly evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>;
  readonly evaluator: IHypothesisEvaluator;
  readonly capabilities: ICapabilityQuery;
  /** The configured pool bound: at most this many evaluate() calls in flight at once, across every hypothesis judged in this call (constraints/hypotheses-are-judged-in-isolated-parallel-calls' own "the pool bound is configuration"). */
  readonly poolSize: number;
  /** The instant this stage starts, as epoch milliseconds. */
  readonly now: number;
  /** The absolute deadline instant propagated from the whole request, as epoch milliseconds (constraints/the-deadline-is-an-absolute-propagated-instant). */
  readonly deadline: number;
};

/**
 * Judges every hypothesis requiresEvaluationOf(theCase) names, in that
 * order, answering exactly one Evaluation per name
 * (rules/investigation/one-evaluation-per-required-hypothesis): a no-data
 * hypothesis never enters the pool, an all-ok hypothesis is judged in its
 * own isolated, retried-once-if-needed call, and every path a hypothesis can
 * take degrades to one of the three declared reasons, never a gap.
 */
export async function judgeHypotheses(options: JudgeHypothesesOptions): Promise<readonly Evaluation[]> {
  const { case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize, now, deadline } = options;
  const deadlineGuard = createDeadlineGuard(Math.max(0, deadline - now));
  const pool = new CallPool(poolSize);
  const requiredNames = requiresEvaluationOf(theCase);
  const caseContext: CaseContext = { title: theCase.title, whenToUse: theCase.when_to_use };
  return Promise.all(
    requiredNames.map((name) =>
      judgeOneHypothesis({
        name,
        hypothesis: hypothesisNamed(theCase, name),
        evidence: evidenceFor(name, evidenceByHypothesis),
        evaluator,
        capabilities,
        pool,
        deadlineGuard,
        caseContext,
      }),
    ),
  );
}

type JudgeOneHypothesisOptions = {
  readonly name: string;
  readonly hypothesis: Hypothesis;
  readonly evidence: readonly Evidence[];
  readonly evaluator: IHypothesisEvaluator;
  readonly capabilities: ICapabilityQuery;
  readonly pool: CallPool;
  readonly deadlineGuard: DeadlineGuard;
  readonly caseContext: CaseContext;
};

/**
 * One hypothesis's whole path: an immediate no-data where its evidence is
 * not all ok (never touching the pool), otherwise a pool slot and one
 * isolated call — or, missing the slot before the deadline, deadline-exceeded
 * without ever calling evaluate(): a hypothesis denied a slot makes no call,
 * so it costs nothing
 * (constraints/hypotheses-are-judged-in-isolated-parallel-calls).
 */
async function judgeOneHypothesis(options: JudgeOneHypothesisOptions): Promise<Evaluation> {
  const { name, hypothesis, evidence, evaluator, capabilities, pool, deadlineGuard, caseContext } = options;
  const nonOkEvidence = evidence.filter((item) => item.result !== 'ok');
  if (nonOkEvidence.length > 0) {
    return noDataEvaluation(name, nonOkEvidence);
  }
  if (!(await acquireSlotOrDeadline(pool, deadlineGuard))) {
    return deadlineExceededEvaluation(name);
  }
  try {
    return await runIsolatedCall({ name, hypothesis, evidence, evaluator, capabilities, deadlineGuard, caseContext });
  } finally {
    pool.release();
  }
}

type RunIsolatedCallOptions = {
  readonly name: string;
  readonly hypothesis: Hypothesis;
  readonly evidence: readonly Evidence[];
  readonly evaluator: IHypothesisEvaluator;
  readonly capabilities: ICapabilityQuery;
  readonly deadlineGuard: DeadlineGuard;
  readonly caseContext: CaseContext;
};

/**
 * Runs the first evaluate() call for one already-slotted hypothesis, races
 * it against the shared deadline, passes an inconclusive answer through
 * unchanged (rules/investigation/judgment-does-not-infer's own domain has
 * nothing more for this stage to add to it), and hands a decided answer to
 * citation validation, retrying through retryOrFail on a structurally
 * invalid one. The pinned case version's own caseContext rides along
 * unchanged on this first call, the same one retryOrFail passes to a retry. The output
 * schemas are resolved before this hypothesis's own first call, never after
 * it: constraints/the-judgment-prompt-is-closed's own third permitted entry
 * puts each evidence item's declared field names inside the very prompt this
 * call sends, so the resolution that citation validation already needed for
 * a decided answer now also feeds toEvidenceItems, one resolution serving
 * both.
 */
async function runIsolatedCall(options: RunIsolatedCallOptions): Promise<Evaluation> {
  const { name, hypothesis, evidence, evaluator, capabilities, deadlineGuard, caseContext } = options;
  const outputSchemas = await outputSchemasFor(evidence, capabilities);
  const evidenceItems = toEvidenceItems(evidence, outputSchemas);
  const first = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion, evidenceItems, caseContext), deadlineGuard);
  if (first === DEADLINE_ELAPSED) {
    return deadlineExceededEvaluation(name);
  }
  if (first.verdict === 'inconclusive') {
    return asEvaluation(name, first);
  }
  const context: HypothesisCitationContext = { collects: hypothesis.collects, evidence, outputSchemas };
  if (isStructurallyValid(context, first.citations)) {
    return asEvaluation(name, first);
  }
  return retryOrFail({ name, hypothesis, evidenceItems, evaluator, deadlineGuard, context, caseContext });
}

type RetryOrFailOptions = {
  readonly name: string;
  readonly hypothesis: Hypothesis;
  readonly evidenceItems: readonly EvidenceItem[];
  readonly evaluator: IHypothesisEvaluator;
  readonly deadlineGuard: DeadlineGuard;
  readonly context: HypothesisCitationContext;
  readonly caseContext: CaseContext;
};

/**
 * The retry-or-fallback policy over a first answer whose citations failed
 * structural validation (scenarios/investigation/a-foreign-citation-is-refused):
 * no retry at all once the deadline has already elapsed; a retry that
 * itself misses the deadline is deadline-exceeded, never judgment-failure;
 * an inconclusive retry answer is passed through unchanged, the same
 * convention as the first call's; and a decided retry answer is judged by
 * the same structural check, falling back to judgment-failure on a second
 * miss. The retry call carries the same caseContext the first call did,
 * unchanged.
 */
async function retryOrFail(options: RetryOrFailOptions): Promise<Evaluation> {
  const { name, hypothesis, evidenceItems, evaluator, deadlineGuard, context, caseContext } = options;
  if (deadlineGuard.elapsed()) {
    return judgmentFailureEvaluation(name);
  }
  const retry = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion, evidenceItems, caseContext), deadlineGuard);
  if (retry === DEADLINE_ELAPSED) {
    return deadlineExceededEvaluation(name);
  }
  if (retry.verdict === 'inconclusive') {
    return asEvaluation(name, retry);
  }
  return isStructurallyValid(context, retry.citations) ? asEvaluation(name, retry) : judgmentFailureEvaluation(name);
}

/**
 * Races one pool acquisition against the shared deadline: true once a slot
 * is actually granted before the deadline, false once the deadline wins —
 * checked synchronously first so an already-elapsed deadline never depends
 * on which of two simultaneously-settled promises a race happens to prefer
 * — and, where the deadline wins but the queued acquisition is granted
 * afterwards regardless, releases it immediately, since this call never
 * uses it.
 */
async function acquireSlotOrDeadline(pool: CallPool, deadlineGuard: DeadlineGuard): Promise<boolean> {
  if (deadlineGuard.elapsed()) {
    return false;
  }
  const acquisition = pool.acquire();
  const acquired = await Promise.race([acquisition.then(() => true), deadlineGuard.signal.then(() => false)]);
  if (!acquired) {
    acquisition.then(() => pool.release());
  }
  return acquired;
}

type DeadlineGuard = {
  /** Resolves to DEADLINE_ELAPSED once this call's own ceiling elapses, shared by every race this call runs. */
  readonly signal: Promise<DeadlineMarker>;
  /** Whether the ceiling has already elapsed, read synchronously — the retry-admission check reads this rather than racing a fresh promise. */
  readonly elapsed: () => boolean;
};

/**
 * Builds the one shared deadline signal this whole judgeHypotheses() call
 * races against: a single timer, started once from the ceiling this call
 * itself computed from `now` and `deadline`, never re-derived from a fresh
 * clock read as calls start at different, pool-determined moments — the
 * only way one absolute instant is honored by every pool-slot wait and every
 * evaluate() call and retry alike, without this module reading a clock of
 * its own.
 */
function createDeadlineGuard(remainingMs: number): DeadlineGuard {
  let hasElapsed = remainingMs <= 0;
  const signal = new Promise<DeadlineMarker>((resolve) => {
    if (hasElapsed) {
      resolve(DEADLINE_ELAPSED);
      return;
    }
    setTimeout(() => {
      hasElapsed = true;
      resolve(DEADLINE_ELAPSED);
    }, remainingMs);
  });
  return { signal, elapsed: () => hasElapsed };
}

/**
 * A small in-process concurrency limiter (constraints/hypotheses-are-judged-in-isolated-parallel-calls'
 * own "the pool bound is configuration"): at most `size` acquisitions
 * outstanding at once, first-come-first-served for whoever queues while it
 * is saturated. No authorized dependency in this project's registry
 * provides one, so this stage owns its own — deliberately minimal: nothing
 * here knows about a deadline or a reason, that is judgeOneHypothesis's own
 * concern, layered on top by racing acquire() against the shared deadline
 * signal.
 */
class CallPool {
  private inFlight = 0;
  private readonly waiting: Array<() => void> = [];

  public constructor(private readonly size: number) {}

  /** Resolves once a slot is free — immediately if one already is, otherwise once release() frees one, in queued order. */
  public acquire(): Promise<void> {
    if (this.inFlight < this.size) {
      this.inFlight += 1;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.waiting.push(() => {
        this.inFlight += 1;
        resolve();
      });
    });
  }

  /** Frees the slot this caller held, granting it to whoever has waited longest, if anyone. */
  public release(): void {
    this.inFlight -= 1;
    const next = this.waiting.shift();
    if (next !== undefined) {
      next();
    }
  }
}

/**
 * Races one evaluate() call against the shared deadline signal, the same
 * discipline evidence-collection-stage.ts's own raceObservation keeps for
 * observe-concept: never waited on past the deadline, and a genuine
 * rejection (the port's own contract says evaluate() never throws for any
 * of its three verdicts) propagates unmodified rather than being read as a
 * domain outcome.
 */
function raceEvaluateAgainstDeadline(
  call: Promise<EvaluationOutcome>,
  deadlineGuard: DeadlineGuard,
): Promise<EvaluationOutcome | DeadlineMarker> {
  return Promise.race([call, deadlineGuard.signal]);
}

/** Whether a decided answer's citations are structurally valid: at least one citation, and every one of them accepted (rules/investigation/a-citation-stays-within-the-hypothesis-collects, rules/investigation/a-cited-field-exists-in-the-capability-output-schema). */
function isStructurallyValid(context: HypothesisCitationContext, citations: readonly Citation[]): boolean {
  if (citations.length === 0) {
    return false;
  }
  const accepted = acceptedCitations({ ...context, citations });
  return accepted.length === citations.length;
}

/**
 * Builds the CapabilityOutputSchemas map citation-validation needs for one
 * hypothesis's own evidence: re-resolves each cited concept's capability
 * through the published registry read, keyed by that capability's own
 * current name and version, never by concept — where the registry no longer
 * holds a capability for a concept, that key is simply absent, which
 * citation-validation already treats as "no fields declared".
 */
async function outputSchemasFor(evidence: readonly Evidence[], capabilities: ICapabilityQuery): Promise<CapabilityOutputSchemas> {
  const concepts = [...new Set(evidence.map((item) => item.concept))];
  const resolutions = await Promise.all(concepts.map((concept) => capabilities.readCapability(concept)));
  const schemas: Record<string, string> = {};
  for (const resolution of resolutions) {
    if (resolution.held) {
      schemas[capabilityOutputSchemaKey(resolution.capability.name, resolution.capability.version)] = resolution.capability.output_schema;
    }
  }
  return schemas;
}

/**
 * Every item of this hypothesis's own (already all-ok, by this point)
 * evidence, reshaped to the EvidenceItem port signature, never the full
 * Evidence record — each item's own declaredFields read from outputSchemas
 * by the same capability-name/version key citation-validation's own
 * citesADeclaredField uses, so the vocabulary a citation is later checked
 * against is exactly the vocabulary this call showed the model.
 */
function toEvidenceItems(evidence: readonly Evidence[], outputSchemas: CapabilityOutputSchemas): readonly EvidenceItem[] {
  return evidence.map((item): EvidenceItem => {
    const key = capabilityOutputSchemaKey(item.capability_name, item.capability_version);
    return { concept: item.concept, result: 'ok', observation: item.observation, declaredFields: declaredFieldsOf(outputSchemas[key]) };
  });
}

/** The hypothesis named within the pinned case version — requiresEvaluationOf(theCase) names come from theCase.hypotheses itself, so this always finds one; a miss is a caller-contract fault, not a domain outcome, thrown the same way FakeHypothesisEvaluator throws for a fixture nobody seeded. */
function hypothesisNamed(theCase: Case, name: string): Hypothesis {
  const hypothesis = theCase.hypotheses.find((candidate) => candidate.name === name);
  if (hypothesis === undefined) {
    throw new Error(`no hypothesis named ${JSON.stringify(name)} exists in case ${JSON.stringify(theCase.slug)}`);
  }
  return hypothesis;
}

/** This required hypothesis's own supplied evidence; an absent map entry is a caller-contract fault (whoever composes this stage owes every required hypothesis its own Evidence[]), thrown rather than silently read as empty. */
function evidenceFor(name: string, evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>): readonly Evidence[] {
  const evidence = evidenceByHypothesis.get(name);
  if (evidence === undefined) {
    throw new Error(`no evidence was supplied for required hypothesis ${JSON.stringify(name)}`);
  }
  return evidence;
}

/** Inconclusive with reason no-data, citing every non-ok evidence item this hypothesis collects — field left as the empty string, evidence-collection-stage's own convention for a value with nothing meaningful to put there. */
function noDataEvaluation(name: string, nonOkEvidence: readonly Evidence[]): Evaluation {
  return {
    hypothesis: name,
    verdict: 'inconclusive',
    reason: 'no-data',
    citations: nonOkEvidence.map((item): Citation => ({ concept: item.concept, field: '' })),
  };
}

/** Inconclusive with reason deadline-exceeded and no citations: nothing failed and the data arrived, only time ran out. */
function deadlineExceededEvaluation(name: string): Evaluation {
  return { hypothesis: name, verdict: 'inconclusive', reason: 'deadline-exceeded', citations: [] };
}

/** Inconclusive with reason judgment-failure and no citations: a decided answer never grounded itself within what the deadline allowed. */
function judgmentFailureEvaluation(name: string): Evaluation {
  return { hypothesis: name, verdict: 'inconclusive', reason: 'judgment-failure', citations: [] };
}

/** Names the hypothesis on an evaluator's own answer, assembling the full domain/investigation/evaluation record this port deliberately leaves to its caller — each branch's verdict written as its own literal so it matches exactly the corresponding member of the Evaluation union. */
function asEvaluation(name: string, outcome: EvaluationOutcome): Evaluation {
  if (outcome.verdict === 'confirmed') {
    return { hypothesis: name, verdict: 'confirmed', citations: outcome.citations };
  }
  if (outcome.verdict === 'refuted') {
    return { hypothesis: name, verdict: 'refuted', citations: outcome.citations };
  }
  return { hypothesis: name, verdict: outcome.verdict, reason: outcome.reason, citations: outcome.citations };
}
