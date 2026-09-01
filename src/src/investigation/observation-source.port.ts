import type { EvidenceResult } from './evidence-result.js';
import type { Subject } from './subject.js';

export type { Subject };

export type ObservationOutcome =
  | { readonly result: 'ok'; readonly observation: string }
  | { readonly result: Exclude<EvidenceResult, 'ok'>; readonly result_detail?: string };

export type ObserveConceptOptions = {
  readonly concept: string;
  readonly subject: Subject;
  readonly requester: string;

  readonly remainingBudgetMs?: number;
};

export interface IObservationSource {

  observeConcept(options: ObserveConceptOptions): Promise<ObservationOutcome>;
}
