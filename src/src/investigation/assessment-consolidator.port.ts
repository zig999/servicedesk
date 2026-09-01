import type { ConsolidationRegister } from './consolidation-register.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { Usage } from './usage.js';

export type ConsolidationOutcome = {
  readonly text: string;
  readonly usage: Usage;
  readonly elapsed_ms: number;
  readonly prompt: string;
};

export interface IAssessmentConsolidator {

  consolidate(
    evaluations: readonly Evaluation[],
    evidence: readonly Evidence[],
    consolidationRegister: ConsolidationRegister,
  ): Promise<ConsolidationOutcome>;
}
