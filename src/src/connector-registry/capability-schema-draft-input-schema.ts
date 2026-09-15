import type { OpenApiOperationReading } from './openapi-operation-reader.js';
import type {
  CapabilitySchemaDraftUnresolvedItem,
  CapabilitySchemaDraftUnresolvedReason,
} from './capability-schema-draft.js';

const NOT_REDUCIBLE_REASON: CapabilitySchemaDraftUnresolvedReason = 'schema-not-reducible-to-a-type';

export type CapabilitySchemaDraftInputSchemaReading = {
  readonly inputSchema: string;
  readonly unresolved: readonly CapabilitySchemaDraftUnresolvedItem[];
};

type InputSchemaCandidate = {
  readonly name: string;
  readonly required: boolean;
  readonly reducedType?: string;
};

type ResolvedInputSchemaCandidate = InputSchemaCandidate & { readonly reducedType: string };

type InputSchemaProperties = Readonly<Record<string, { readonly type: string }>>;

export function draftedInputSchema(reading: OpenApiOperationReading): CapabilitySchemaDraftInputSchemaReading {
  const candidates = nonCollidingCandidates(reading);
  const resolved = candidates.filter(hasReducedType);
  const properties = propertiesOf(resolved);
  const required = resolved.filter((candidate) => candidate.required).map((candidate) => candidate.name);
  const unresolved = candidates.filter((candidate) => !hasReducedType(candidate)).map(unresolvedItemOf);
  return { inputSchema: JSON.stringify(inputSchemaObject(properties, required)), unresolved };
}

function inputSchemaObject(
  properties: InputSchemaProperties,
  required: readonly string[],
): Readonly<Record<string, unknown>> {
  return required.length > 0 ? { properties, required } : { properties };
}

function propertiesOf(resolved: readonly ResolvedInputSchemaCandidate[]): InputSchemaProperties {
  return Object.fromEntries(resolved.map((candidate) => [candidate.name, { type: candidate.reducedType }]));
}

function hasReducedType(candidate: InputSchemaCandidate): candidate is ResolvedInputSchemaCandidate {
  return candidate.reducedType !== undefined;
}

function unresolvedItemOf(candidate: InputSchemaCandidate): CapabilitySchemaDraftUnresolvedItem {
  return { name: candidate.name, reason: NOT_REDUCIBLE_REASON };
}

function nonCollidingCandidates(reading: OpenApiOperationReading): readonly InputSchemaCandidate[] {
  const all = allCandidates(reading);
  const counts = countsByName(all);
  return all.filter((candidate) => counts.get(candidate.name) === 1);
}

function allCandidates(reading: OpenApiOperationReading): readonly InputSchemaCandidate[] {
  return [
    ...reading.parameterDetails.map((parameter) => ({
      name: parameter.name,
      required: parameter.required,
      reducedType: parameter.reducedType,
    })),
    ...reading.requestBodyFields,
  ];
}

function countsByName(candidates: readonly InputSchemaCandidate[]): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const candidate of candidates) {
    counts.set(candidate.name, (counts.get(candidate.name) ?? 0) + 1);
  }
  return counts;
}
