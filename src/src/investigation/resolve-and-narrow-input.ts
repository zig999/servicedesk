import { requiresEvaluationOf, resolveOutcome, type ResolvedOutcome, type Verdicts } from '../case/case-resolution.js';
import type { Case } from '../case/case.js';
import type { Citation } from './citation.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { Verdict } from './verdict.js';

export type ResolveAndNarrowOptions = {
  readonly case: Case;
  readonly evaluations: readonly Evaluation[];

  readonly evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>;
};

export type NarrowedInput = {

  readonly evaluations: readonly Evaluation[];

  readonly evidence: readonly Evidence[];
};

export type ResolveAndNarrowResult = {

  readonly resolved: ResolvedOutcome;
  readonly narrowedInput: NarrowedInput;
};

export function resolveAndNarrow(options: ResolveAndNarrowOptions): ResolveAndNarrowResult {
  const { case: theCase, evaluations, evidenceByHypothesis } = options;
  const resolved = resolveOutcome(theCase, verdictsOf(evaluations));
  const narrowedInput = narrowInput(theCase, evaluations, evidenceByHypothesis);
  return { resolved, narrowedInput };
}

function verdictsOf(evaluations: readonly Evaluation[]): Verdicts {
  const verdicts: Record<string, Verdict> = {};
  for (const evaluation of evaluations) {
    verdicts[evaluation.hypothesis] = evaluation.verdict;
  }
  return verdicts;
}

function narrowInput(
  theCase: Case,
  evaluations: readonly Evaluation[],
  evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>,
): NarrowedInput {
  const requiredEvaluations = requiredEvaluationsOf(theCase, evaluations);
  return { evaluations: requiredEvaluations, evidence: narrowedEvidenceOf(requiredEvaluations, evidenceByHypothesis) };
}

function requiredEvaluationsOf(theCase: Case, evaluations: readonly Evaluation[]): readonly Evaluation[] {
  const required = new Set(requiresEvaluationOf(theCase));
  return evaluations.filter((evaluation) => required.has(evaluation.hypothesis));
}

function narrowedEvidenceOf(
  evaluations: readonly Evaluation[],
  evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>,
): readonly Evidence[] {
  const seenConcepts = new Set<string>();
  const evidence: Evidence[] = [];
  for (const evaluation of evaluations) {
    for (const citation of evaluation.citations) {
      if (seenConcepts.has(citation.concept)) {
        continue;
      }
      seenConcepts.add(citation.concept);
      evidence.push(evidenceForCitation(evaluation.hypothesis, citation, evidenceByHypothesis));
    }
  }
  return evidence;
}

function evidenceForCitation(
  hypothesis: string,
  citation: Citation,
  evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>,
): Evidence {
  const hypothesisEvidence = evidenceByHypothesis.get(hypothesis);
  if (hypothesisEvidence === undefined) {
    throw new Error(`no evidence was supplied for required hypothesis ${JSON.stringify(hypothesis)}`);
  }
  const named = hypothesisEvidence.find((item) => item.concept === citation.concept);
  if (named === undefined) {
    throw new Error(`no evidence for concept ${JSON.stringify(citation.concept)} was supplied for hypothesis ${JSON.stringify(hypothesis)}`);
  }
  return named;
}
