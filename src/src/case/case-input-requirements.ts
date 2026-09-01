import {
  declaredInputSchemaShape,
  inputSchemaShapeProblems,
} from '../capability-registry/capability-input-schema-shape.js';
import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import type { Capability } from '../capability-registry/capability.js';
import { collectionPlan } from './case-resolution.js';
import type { Case } from './case.js';

type CapabilityIdentity = Readonly<{ name: string; version: string }>;

export type CaseInputRequirement = {
  readonly attribute: string;
  readonly required: boolean;
  readonly capabilities: readonly CapabilityIdentity[];
};

export type CaseInputRequirementsResult = {
  readonly requirements: readonly CaseInputRequirement[];
  readonly capabilities_with_malformed_input_schema: readonly CapabilityIdentity[];
};

const EVERY_REGISTERED_CAPABILITY_LIMIT = Number.MAX_SAFE_INTEGER;

export async function everyRegisteredCapability(capabilities: ICapabilityQuery): Promise<readonly Capability[]> {
  const page = await capabilities.listCapabilities({ offset: 0, limit: EVERY_REGISTERED_CAPABILITY_LIMIT });
  return page.data;
}

function soleAnswerer(concept: string, capabilities: readonly Capability[]): Capability | undefined {
  const answering = capabilities.filter((capability) => capability.concept === concept);
  return answering.length === 1 ? answering[0] : undefined;
}

function identityOf(capability: Capability): CapabilityIdentity {
  return { name: capability.name, version: capability.version };
}

function hasWellFormedInputSchema(capability: Capability): boolean {
  const parsed: unknown = JSON.parse(capability.input_schema);
  return inputSchemaShapeProblems(parsed).length === 0;
}

type Accumulator = {
  readonly order: string[];
  readonly capabilitiesByAttribute: Map<string, CapabilityIdentity[]>;
  readonly requiredAttributes: Set<string>;
  readonly malformed: CapabilityIdentity[];
};

function newAccumulator(): Accumulator {
  return { order: [], capabilitiesByAttribute: new Map(), requiredAttributes: new Set(), malformed: [] };
}

function foldContribution(accumulator: Accumulator, capability: Capability): void {
  const shape = declaredInputSchemaShape(capability.input_schema);
  for (const attribute of shape.properties) {
    if (!accumulator.capabilitiesByAttribute.has(attribute)) {
      accumulator.order.push(attribute);
      accumulator.capabilitiesByAttribute.set(attribute, []);
    }
    accumulator.capabilitiesByAttribute.get(attribute)?.push(identityOf(capability));
  }
  for (const attribute of shape.required) {
    accumulator.requiredAttributes.add(attribute);
  }
}

function foldConcept(accumulator: Accumulator, concept: string, capabilities: readonly Capability[]): void {
  const capability = soleAnswerer(concept, capabilities);
  if (capability === undefined) {
    return;
  }
  if (!hasWellFormedInputSchema(capability)) {
    accumulator.malformed.push(identityOf(capability));
    return;
  }
  foldContribution(accumulator, capability);
}

function requirementsOf(accumulator: Accumulator): readonly CaseInputRequirement[] {
  return accumulator.order.map((attribute) => ({
    attribute,
    required: accumulator.requiredAttributes.has(attribute),
    capabilities: accumulator.capabilitiesByAttribute.get(attribute) ?? [],
  }));
}

export function deriveCaseInputRequirements(
  theCase: Case,
  registeredCapabilities: readonly Capability[],
): CaseInputRequirementsResult {
  const accumulator = newAccumulator();
  for (const concept of collectionPlan(theCase)) {
    foldConcept(accumulator, concept, registeredCapabilities);
  }
  return {
    requirements: requirementsOf(accumulator),
    capabilities_with_malformed_input_schema: accumulator.malformed,
  };
}
