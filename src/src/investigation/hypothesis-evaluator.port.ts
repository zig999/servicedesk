import type { ObservationOutcome } from './observation-source.port.js';
import type { Citation } from './citation.js';
import type { EvaluationReason } from './evaluation-reason.js';
import type { FieldSemantics } from './field-semantics.js';
import type { Usage } from './usage.js';
import type { Verdict } from './verdict.js';

export type EvidenceItem = {
  readonly concept: string;
  readonly fields: readonly FieldSemantics[];
  readonly concept_description: string;
} & ObservationOutcome;

export type EvaluationOutcome =
  | {
      readonly verdict: 'confirmed';
      readonly citations: readonly [Citation, ...Citation[]];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    }
  | {
      readonly verdict: 'refuted';
      readonly citations: readonly [Citation, ...Citation[]];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    }
  | {
      readonly verdict: Exclude<Verdict, 'confirmed' | 'refuted'>;
      readonly reason: EvaluationReason;
      readonly citations: readonly Citation[];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    };

export type CaseContext = {
  readonly title: string;
  readonly whenToUse: string;
};

export interface IHypothesisEvaluator {

  evaluate(
    criterion: string,
    evidence: readonly EvidenceItem[],
    caseContext: CaseContext,
  ): Promise<EvaluationOutcome>;
}
