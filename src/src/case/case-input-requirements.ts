// The derived read a case version's input requirements answers
// (contracts/knowledge/case-input-requirements,
// rules/knowledge/a-case-versions-input-requirements-are-derived): the union
// of subject attributes the input schemas of the capabilities currently
// answering the case version's own collection-plan concepts declare in
// properties, which of those the case cannot be diagnosed without, and every
// currently-registered capability asking for each — computed fresh from the
// case's own collection plan (case-resolution.ts's own collectionPlan) and
// every capability currently registered, never stored or cached
// (rules/knowledge/the-contract-check-reads-the-current-registration). A
// concept the plan holds that no registered capability currently answers, or
// that more than one currently answers, contributes no attribute — the same
// "reads the registration as it stands" posture
// every-collected-concept-has-a-read-only-capability's own coherence check
// already applies, degraded here to data rather than a refusal, since this
// read must still answer for a draft that has not yet reached coherence
// (contracts/knowledge/case-input-requirements's own "a curator composing a
// draft wants the same read a diagnose will one day be held to"). A
// capability whose own stored input_schema does not currently hold a
// well-formed shape contributes no attribute either, and is named apart from
// the attribute entries
// (rules/integration/a-capability-input-schema-holds-a-well-formed-object,
// scenarios/integration/a-legacy-capability-declares-no-input-attributes) —
// reusing the shared shape reader declaredInputSchemaShape and its own
// inputSchemaShapeProblems (capability-input-schema-shape.ts) rather than a
// second parser (MNT-03,
// task/capability-input-schema-contract/refuse-malformed-capability-input-schema).
//
// Every currently-held capability's own input_schema is guaranteed
// syntactically valid JSON at registration
// (rules/integration/a-capability-declares-well-formed-schemas), so only the
// declared *shape* — never the JSON syntax — can still depart for a
// capability registered before that shape rule existed; this module's own
// hasWellFormedInputSchema below parses it directly rather than defending
// against a JSON.parse throw that the registration invariant already rules
// out (an inference from that rule, disclosed in this task's own delivery
// record rather than reproven here).

import {
  declaredInputSchemaShape,
  inputSchemaShapeProblems,
} from '../capability-registry/capability-input-schema-shape.js';
import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import type { Capability } from '../capability-registry/capability.js';
import { collectionPlan } from './case-resolution.js';
import type { Case } from './case.js';

/**
 * One currently registered capability's own identity — name and version
 * (domain/integration/capability) — restated locally the same minimal alias
 * duplicate-concept-answer.error.ts and concept-already-answered.error.ts
 * already keep (MNT-03 kept in spirit): a two-field identity pair is not the
 * shared shape reader this module's own dependency exists to avoid
 * duplicating, so it is declared once per consuming module the same way
 * those two error files already do.
 */
type CapabilityIdentity = Readonly<{ name: string; version: string }>;

/**
 * domain/knowledge/case-input-requirement: one subject attribute the case
 * version's collection plan reaches, whether the case requires it, and every
 * capability currently asking for it — never fewer than one, since an
 * attribute nobody currently asks for is never named here at all.
 */
export type CaseInputRequirement = {
  readonly attribute: string;
  readonly required: boolean;
  readonly capabilities: readonly CapabilityIdentity[];
};

/**
 * What read-case-input-requirements answers
 * (contracts/knowledge/case-input-requirements): the derived requirements,
 * and, apart from them, every capability the collection plan resolves whose
 * own stored input schema does not currently hold a well-formed shape.
 */
export type CaseInputRequirementsResult = {
  readonly requirements: readonly CaseInputRequirement[];
  readonly capabilities_with_malformed_input_schema: readonly CapabilityIdentity[];
};

/**
 * The limit passed to ICapabilityQuery.listCapabilities when this derivation
 * reads every currently registered capability, rather than one caller-facing
 * page: the standard's configured page-limit bound (API-04) reaches only a
 * route's own controller or routes module
 * (backend-node-service.yaml's own applies_to), never a service-internal
 * call reading its own upstream registry in full, so this constant is this
 * module's own, named rather than spelled inline where it is used (TYP-04).
 */
const EVERY_REGISTERED_CAPABILITY_LIMIT = Number.MAX_SAFE_INTEGER;

/**
 * Every capability currently registered, read fresh through the published
 * capability-registry contract on every call, never remembered
 * (rules/knowledge/the-contract-check-reads-the-current-registration) — the
 * existing list-capabilities read (capability-query.port.ts), asked for
 * every registration in one page rather than a new port method, since the
 * page-limit bound this module's own header comment explains does not reach
 * this internal call (an inference, disclosed in this task's own delivery
 * record: ICapabilityQuery exposes no unpaginated "every capability" read of
 * its own, and widening the published contract for this one internal
 * caller reaches past what this task touches).
 */
export async function everyRegisteredCapability(capabilities: ICapabilityQuery): Promise<readonly Capability[]> {
  const page = await capabilities.listCapabilities({ offset: 0, limit: EVERY_REGISTERED_CAPABILITY_LIMIT });
  return page.data;
}

/**
 * The one capability currently answering a concept, or undefined where no
 * registered capability answers it or more than one does
 * (rules/knowledge/a-case-versions-input-requirements-are-derived's own "or
 * that more than one currently answers, contributes no attribute").
 */
function soleAnswerer(concept: string, capabilities: readonly Capability[]): Capability | undefined {
  const answering = capabilities.filter((capability) => capability.concept === concept);
  return answering.length === 1 ? answering[0] : undefined;
}

/** One capability, reshaped to the bare identity a case-input-requirement names it by (domain/integration/capability's own "already carries its own name, version, connector and the concept it answers; nothing here restates them"). */
function identityOf(capability: Capability): CapabilityIdentity {
  return { name: capability.name, version: capability.version };
}

/**
 * Whether a capability's own stored input schema currently holds the
 * declared well-formed shape
 * (rules/integration/a-capability-input-schema-holds-a-well-formed-object) —
 * parsed directly, since every currently-held capability's input_schema is
 * guaranteed syntactically valid JSON at registration (this module's own
 * header comment), so only the shape itself, never the JSON syntax, can
 * still depart for a capability registered before this rule existed.
 */
function hasWellFormedInputSchema(capability: Capability): boolean {
  const parsed: unknown = JSON.parse(capability.input_schema);
  return inputSchemaShapeProblems(parsed).length === 0;
}

/** The running state one pass over the collection plan's concepts folds into: attributes in first-seen order, their own askers, which are required, and every malformed capability found along the way. */
type Accumulator = {
  readonly order: string[];
  readonly capabilitiesByAttribute: Map<string, CapabilityIdentity[]>;
  readonly requiredAttributes: Set<string>;
  readonly malformed: CapabilityIdentity[];
};

function newAccumulator(): Accumulator {
  return { order: [], capabilitiesByAttribute: new Map(), requiredAttributes: new Set(), malformed: [] };
}

/**
 * Folds one concept's sole answering, well-formed capability's own declared
 * input-schema shape into the accumulator: every attribute its properties
 * names is recorded once, in first-seen order, with this capability added
 * among its askers, and every attribute its own required also names is
 * marked required.
 */
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

/**
 * One concept's own contribution: the sole well-formed answerer folds its
 * declared attributes in, and a sole answerer whose own schema is malformed
 * is recorded apart instead, contributing no attribute
 * (scenarios/integration/a-legacy-capability-declares-no-input-attributes) —
 * a concept nothing currently answers, or that more than one currently
 * answers, contributes nothing either way, silently.
 */
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

/** Reads the accumulator's own attribute order back into case-input-requirement entries (domain/knowledge/case-input-requirement). */
function requirementsOf(accumulator: Accumulator): readonly CaseInputRequirement[] {
  return accumulator.order.map((attribute) => ({
    attribute,
    required: accumulator.requiredAttributes.has(attribute),
    capabilities: accumulator.capabilitiesByAttribute.get(attribute) ?? [],
  }));
}

/**
 * read-case-input-requirements' own pure derivation
 * (rules/knowledge/a-case-versions-input-requirements-are-derived): given the
 * case version's own collection plan (case-resolution.ts's own
 * collectionPlan, read in its own precedence order) and every capability
 * currently registered, answers one entry per distinct subject attribute any
 * capability answering one of the plan's concepts declares, and, apart from
 * them, every capability the plan resolves whose own stored input schema
 * does not currently hold a well-formed shape. Answers identically for a
 * case version in draft or released state — nothing here reads theCase.state
 * at all (rules/knowledge/a-case-versions-input-requirements-are-derived's
 * own eventual consistency, contracts/knowledge/case-input-requirements's
 * own "available for a case version in either state").
 */
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
