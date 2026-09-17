import { expectTypeOf, it } from 'vitest';
import type { Evidence } from '../../../investigation/evidence.js';
import type { EvidenceResult } from '../../../investigation/evidence-result.js';
import type { FieldSemantics } from '../../../investigation/field-semantics.js';

it('declares every attribute domain/investigation/evidence names, each with its own required-or-optional shape, capability_payload_notes included as a required string', () => {
  expectTypeOf<Evidence>().toEqualTypeOf<{
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
    readonly capability_payload_notes: string;
  }>();
});
