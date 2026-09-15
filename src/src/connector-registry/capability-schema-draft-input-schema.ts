import type { OpenApiOperationReading, OpenApiParameterLocation } from './openapi-operation-reader.js';
import type {
  CapabilitySchemaDraftUnresolvedItem,
  CapabilitySchemaDraftUnresolvedReason,
} from './capability-schema-draft.js';

const NOT_REDUCIBLE_REASON: CapabilitySchemaDraftUnresolvedReason = 'schema-not-reducible-to-a-type';
const NAME_CLAIMED_REASON: CapabilitySchemaDraftUnresolvedReason = 'name-claimed-by-another-parameter';

const PARAMETER_LOCATION_PRECEDENCE: Readonly<Record<OpenApiParameterLocation, number>> = {
  path: 0,
  query: 1,
  header: 2,
  cookie: 3,
};
const REQUEST_BODY_FIELD_PRECEDENCE = 4;

export type CapabilitySchemaDraftInputSchemaReading = {
  readonly inputSchema: string;
  readonly unresolved: readonly CapabilitySchemaDraftUnresolvedItem[];
};

type InputSchemaCandidate = {
  readonly name: string;
  readonly required: boolean;
  readonly reducedType?: string;
  readonly precedenceRank: number;
  readonly precedenceIndex: number;
};

type ResolvedInputSchemaCandidate = InputSchemaCandidate & { readonly reducedType: string };

type InputSchemaProperties = Readonly<Record<string, { readonly type: string }>>;

export function draftedInputSchema(reading: OpenApiOperationReading): CapabilitySchemaDraftInputSchemaReading {
  const groups = candidateGroupsByName(reading);
  const winners = groups.map(firstInDeclaredOrder);
  const resolved = winners.filter(hasReducedType);
  const properties = propertiesOf(resolved);
  const required = resolved.filter((candidate) => candidate.required).map((candidate) => candidate.name);
  const unresolved = groups.flatMap(unresolvedItemsOf);
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

function firstInDeclaredOrder(group: readonly InputSchemaCandidate[]): InputSchemaCandidate {
  return group[0];
}

function unresolvedItemsOf(group: readonly InputSchemaCandidate[]): readonly CapabilitySchemaDraftUnresolvedItem[] {
  const [winner, ...displaced] = group;
  const winnerItems = hasReducedType(winner) ? [] : [unresolvedItemOf(winner, NOT_REDUCIBLE_REASON)];
  return [...winnerItems, ...displaced.flatMap(unresolvedItemsForDisplacedClaimant)];
}

function unresolvedItemsForDisplacedClaimant(
  candidate: InputSchemaCandidate,
): readonly CapabilitySchemaDraftUnresolvedItem[] {
  const claimedItem = unresolvedItemOf(candidate, NAME_CLAIMED_REASON);
  return hasReducedType(candidate) ? [claimedItem] : [unresolvedItemOf(candidate, NOT_REDUCIBLE_REASON), claimedItem];
}

function unresolvedItemOf(
  candidate: InputSchemaCandidate,
  reason: CapabilitySchemaDraftUnresolvedReason,
): CapabilitySchemaDraftUnresolvedItem {
  return { name: candidate.name, reason };
}

function candidateGroupsByName(reading: OpenApiOperationReading): readonly (readonly InputSchemaCandidate[])[] {
  const grouped = new Map<string, InputSchemaCandidate[]>();
  for (const candidate of allCandidates(reading)) {
    const group = grouped.get(candidate.name) ?? [];
    group.push(candidate);
    grouped.set(candidate.name, group);
  }
  return [...grouped.values()].map(orderedByDeclaredPrecedence);
}

function orderedByDeclaredPrecedence(group: readonly InputSchemaCandidate[]): readonly InputSchemaCandidate[] {
  return [...group].sort((a, b) => a.precedenceRank - b.precedenceRank || a.precedenceIndex - b.precedenceIndex);
}

function allCandidates(reading: OpenApiOperationReading): readonly InputSchemaCandidate[] {
  return [...parameterCandidates(reading), ...requestBodyFieldCandidates(reading)];
}

function parameterCandidates(reading: OpenApiOperationReading): readonly InputSchemaCandidate[] {
  return reading.parameterDetails.map((parameter, precedenceIndex) => ({
    name: parameter.name,
    required: parameter.required,
    reducedType: parameter.reducedType,
    precedenceRank: PARAMETER_LOCATION_PRECEDENCE[parameter.location],
    precedenceIndex,
  }));
}

function requestBodyFieldCandidates(reading: OpenApiOperationReading): readonly InputSchemaCandidate[] {
  return reading.requestBodyFields.map((field, precedenceIndex) => ({
    name: field.name,
    required: field.required,
    reducedType: field.reducedType,
    precedenceRank: REQUEST_BODY_FIELD_PRECEDENCE,
    precedenceIndex,
  }));
}
