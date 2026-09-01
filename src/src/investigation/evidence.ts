import type { EvidenceResult } from './evidence-result.js';
import type { FieldSemantics } from './field-semantics.js';

export const DEFAULT_EVIDENCE_TTL_SECONDS = 60;

export type Evidence = {
  readonly concept: string;

  readonly inputs: string;

  readonly observation: string;

  readonly observed_at: string;
  readonly ttl: number;

  readonly origin: string;
  readonly result: EvidenceResult;
  readonly result_detail?: string;
  readonly capability_name: string;
  readonly capability_version: string;

  readonly elapsed_ms: number;

  readonly fields: readonly FieldSemantics[];

  readonly concept_description: string;
};
