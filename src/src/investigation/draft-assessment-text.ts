import type { ResolvedOutcome } from '../case/case-resolution.js';
import type { Assessment } from './assessment.js';
import type { IAssessmentConsolidator } from './assessment-consolidator.port.js';
import type { ConsolidationRegister } from './consolidation-register.js';
import type { NarrowedInput } from './resolve-and-narrow-input.js';

export type DraftAssessmentOptions = {

  readonly resolved: ResolvedOutcome;

  readonly narrowedInput: NarrowedInput;

  readonly consolidationRegister: ConsolidationRegister;

  readonly consolidator: IAssessmentConsolidator;
};

export async function draftAssessment(options: DraftAssessmentOptions): Promise<Assessment> {
  const { resolved, narrowedInput, consolidationRegister, consolidator } = options;

  const { text } = await consolidator.consolidate(narrowedInput.evaluations, narrowedInput.evidence, consolidationRegister);
  const base = { outcome: resolved.outcome, referral: resolved.referral, text };
  return resolved.determining === undefined ? base : { ...base, determining_hypothesis: resolved.determining };
}
