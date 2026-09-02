import { requiresEvaluationOf } from '../case/case-resolution.js';
import type { Case, Hypothesis } from '../case/case.js';
import type { Citation } from './citation.js';
import { acceptedCitations, type HypothesisCitationContext } from './citation-validation.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { CaseContext, EvaluationOutcome, EvidenceItem, IHypothesisEvaluator } from './hypothesis-evaluator.port.js';
import type { Usage } from './usage.js';

const DEADLINE_ELAPSED = Symbol('judgment-stage-deadline-elapsed');
type DeadlineMarker = typeof DEADLINE_ELAPSED;

export type JudgeHypothesesOptions = {
  readonly case: Case;

  readonly evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>;
  readonly evaluator: IHypothesisEvaluator;

  readonly poolSize: number;

  readonly now: number;

  readonly deadline: number;
};

export async function judgeHypotheses(options: JudgeHypothesesOptions): Promise<readonly Evaluation[]> {
  const { case: theCase, evidenceByHypothesis, evaluator, poolSize, now, deadline } = options;
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
  readonly pool: CallPool;
  readonly deadlineGuard: DeadlineGuard;
  readonly caseContext: CaseContext;
};

async function judgeOneHypothesis(options: JudgeOneHypothesisOptions): Promise<Evaluation> {
  const { name, hypothesis, evidence, evaluator, pool, deadlineGuard, caseContext } = options;
  const nonOkEvidence = evidence.filter((item) => item.result !== 'ok');
  if (nonOkEvidence.length > 0) {
    return noDataEvaluation(name, nonOkEvidence);
  }
  if (!(await acquireSlotOrDeadline(pool, deadlineGuard))) {
    return deadlineExceededEvaluation(name);
  }
  try {
    return await runIsolatedCall({ name, hypothesis, evidence, evaluator, deadlineGuard, caseContext });
  } finally {
    pool.release();
  }
}

type RunIsolatedCallOptions = {
  readonly name: string;
  readonly hypothesis: Hypothesis;
  readonly evidence: readonly Evidence[];
  readonly evaluator: IHypothesisEvaluator;
  readonly deadlineGuard: DeadlineGuard;
  readonly caseContext: CaseContext;
};

async function runIsolatedCall(options: RunIsolatedCallOptions): Promise<Evaluation> {
  const { name, hypothesis, evidence, evaluator, deadlineGuard, caseContext } = options;
  const evidenceItems = toEvidenceItems(evidence);
  const first = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion, evidenceItems, caseContext), deadlineGuard);
  if (first === DEADLINE_ELAPSED) {
    return deadlineExceededEvaluation(name);
  }
  const context: HypothesisCitationContext = { collects: hypothesis.collects, evidence };
  if (citationsAreAcceptable(context, first)) {
    return asEvaluation(name, first);
  }
  return retryOrFail({ name, hypothesis, evidenceItems, evaluator, deadlineGuard, context, caseContext, first });
}

type RetryOrFailOptions = {
  readonly name: string;
  readonly hypothesis: Hypothesis;
  readonly evidenceItems: readonly EvidenceItem[];
  readonly evaluator: IHypothesisEvaluator;
  readonly deadlineGuard: DeadlineGuard;
  readonly context: HypothesisCitationContext;
  readonly caseContext: CaseContext;
  readonly first: EvaluationOutcome;
};

async function retryOrFail(options: RetryOrFailOptions): Promise<Evaluation> {
  const { name, hypothesis, evidenceItems, evaluator, deadlineGuard, context, caseContext, first } = options;
  if (deadlineGuard.elapsed()) {
    return judgmentFailureEvaluation(name, first);
  }
  const retry = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion, evidenceItems, caseContext), deadlineGuard);
  if (retry === DEADLINE_ELAPSED) {
    return deadlineExceededEvaluation(name);
  }
  return citationsAreAcceptable(context, retry) ? asEvaluation(name, retry) : judgmentFailureEvaluation(name, retry);
}

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

  readonly signal: Promise<DeadlineMarker>;

  readonly elapsed: () => boolean;
};

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

class CallPool {
  private inFlight = 0;
  private readonly waiting: Array<() => void> = [];

  public constructor(private readonly size: number) {}

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

  public release(): void {
    this.inFlight -= 1;
    const next = this.waiting.shift();
    if (next !== undefined) {
      next();
    }
  }
}

function raceEvaluateAgainstDeadline(
  call: Promise<EvaluationOutcome>,
  deadlineGuard: DeadlineGuard,
): Promise<EvaluationOutcome | DeadlineMarker> {
  return Promise.race([call, deadlineGuard.signal]);
}

function citationsAreAcceptable(context: HypothesisCitationContext, outcome: EvaluationOutcome): boolean {
  if (outcome.verdict === 'inconclusive' && outcome.citations.length === 0) {
    return true;
  }
  return isStructurallyValid(context, outcome.citations);
}

function isStructurallyValid(context: HypothesisCitationContext, citations: readonly Citation[]): boolean {
  if (citations.length === 0) {
    return false;
  }
  const accepted = acceptedCitations({ ...context, citations });
  return accepted.length === citations.length;
}

function toEvidenceItems(evidence: readonly Evidence[]): readonly EvidenceItem[] {
  return evidence.map((item): EvidenceItem => ({
    concept: item.concept,
    result: 'ok',
    observation: item.observation,
    fields: item.fields,
    concept_description: item.concept_description,
  }));
}

function hypothesisNamed(theCase: Case, name: string): Hypothesis {
  return theCase.hypotheses.find((candidate) => candidate.name === name)!;
}

function evidenceFor(name: string, evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>): readonly Evidence[] {
  return evidenceByHypothesis.get(name)!;
}

function noDataEvaluation(name: string, nonOkEvidence: readonly Evidence[]): Evaluation {
  return {
    hypothesis: name,
    verdict: 'inconclusive',
    reason: 'no-data',
    citations: nonOkEvidence.map((item): Citation => ({ concept: item.concept })),
  };
}

function deadlineExceededEvaluation(name: string): Evaluation {
  return { hypothesis: name, verdict: 'inconclusive', reason: 'deadline-exceeded', citations: [] };
}

function judgmentFailureEvaluation(name: string, outcome: EvaluationOutcome): Evaluation {
  const callRecord = callRecordOf(outcome);
  return { hypothesis: name, verdict: 'inconclusive', reason: 'judgment-failure', citations: [], ...callRecord };
}

function asEvaluation(name: string, outcome: EvaluationOutcome): Evaluation {
  const callRecord = callRecordOf(outcome);
  if (outcome.verdict === 'confirmed') {
    return { hypothesis: name, verdict: 'confirmed', citations: outcome.citations, ...callRecord };
  }
  if (outcome.verdict === 'refuted') {
    return { hypothesis: name, verdict: 'refuted', citations: outcome.citations, ...callRecord };
  }
  return { hypothesis: name, verdict: outcome.verdict, reason: outcome.reason, citations: outcome.citations, ...callRecord };
}

function callRecordOf(outcome: EvaluationOutcome): { readonly usage?: Usage; readonly elapsed_ms?: number; readonly prompt?: string } {
  const record: { usage?: Usage; elapsed_ms?: number; prompt?: string } = {};
  if (outcome.usage !== undefined) {
    record.usage = outcome.usage;
  }
  if (outcome.elapsed_ms !== undefined) {
    record.elapsed_ms = outcome.elapsed_ms;
  }
  if (outcome.prompt !== undefined) {
    record.prompt = outcome.prompt;
  }
  return record;
}
