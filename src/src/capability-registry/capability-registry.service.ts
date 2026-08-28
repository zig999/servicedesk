import { CapabilityIdentityNotFoundError } from '../errors/capability-identity-not-found.error.js';
import { CapabilityNotReadOnlyError } from '../errors/capability-not-read-only.error.js';
import { CapabilitySchemaNotWellFormedError } from '../errors/capability-schema-not-well-formed.error.js';
import { ConceptAlreadyAnsweredError } from '../errors/concept-already-answered.error.js';
import { DuplicateConceptAnswerError } from '../errors/duplicate-concept-answer.error.js';
import { IncompleteCapabilityContractError } from '../errors/incomplete-capability-contract.error.js';
import { MalformedCapabilityInputSchemaError } from '../errors/malformed-capability-input-schema.error.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import { inputSchemaShapeProblems } from './capability-input-schema-shape.js';
import type { CapabilityResolution, ICapabilityQuery } from './capability-query.port.js';
import type { ICapabilityStore } from './capability-store.port.js';
import {
  DEFAULT_CAPABILITY_TIMEOUT_MS,
  READ_ONLY_NATURE,
  REQUIRED_REGISTRATION_ATTRIBUTES,
  SCHEMA_ATTRIBUTES,
  type Capability,
  type CapabilityRegistration,
} from './capability.js';

/**
 * The registry's two operations (domain/integration/capability-registry):
 * register-capability holds every registration to the declared contract —
 * only read-only registers, a registration lacking its contract is refused,
 * a schema that is not syntactically valid JSON is refused
 * (rules/integration/a-capability-declares-well-formed-schemas), an input
 * schema that parses but does not hold a well-formed shape is refused
 * (rules/integration/a-capability-input-schema-holds-a-well-formed-object),
 * and a concept a different capability already answers is refused
 * (rules/integration/one-capability-answers-one-concept) — before anything
 * is written; resolve-concept is the one lookup from a concept to the
 * capability that answers it, provided as the published capability-registry
 * contract, so a consumer holding ICapabilityQuery reads the registry
 * without depending on this class or its store. Persistence reaches it only
 * through the store port, so this module stays importable without any
 * infrastructure.
 */
/**
 * What resolving a capability by its own identity (name and version)
 * answers (task/connector-diagnostics/test-connector-route): the capability
 * currently held under that identity, whole, or its absence stated as
 * data — never an invented capability and never an error — the same shape
 * capability-query.port.ts's own CapabilityResolution already gives the
 * concept-keyed read.
 */
export type CapabilityIdentityResolution =
  | { readonly held: true; readonly capability: Capability }
  | { readonly held: false; readonly name: string; readonly version: string };

export class CapabilityRegistryService implements ICapabilityQuery {
  public constructor(private readonly store: ICapabilityStore) {}

  /**
   * register-capability: refuses a registration that does not declare its
   * contract completely (rules/integration/a-capability-declares-its-contract),
   * whose input schema or output schema is not syntactically valid JSON
   * (rules/integration/a-capability-declares-well-formed-schemas), whose
   * input schema parses but does not declare properties as an object or
   * names a required key absent from properties
   * (rules/integration/a-capability-input-schema-holds-a-well-formed-object),
   * whose nature is not read-only (rules/integration/a-capability-is-read-only),
   * or whose concept a different capability already answers
   * (rules/integration/one-capability-answers-one-concept) — every refusal
   * raised before any write. The rest is held — a re-registration under an
   * already-held name and version replacing the record it holds, since a
   * capability is identified by name and version — and answered as held,
   * the timeout defaulted where the registration stated none.
   */
  public async registerCapability(registration: CapabilityRegistration): Promise<Capability> {
    const capability = heldCapability(registration);
    const held = await this.store.readCapabilities();
    const kept = held.filter((candidate) => !sameIdentity(candidate, capability));
    refuseAnsweredConcept(kept, capability);
    await this.store.writeCapabilities([...kept, capability]);
    return capability;
  }

  /**
   * read-capability (contracts/integration/capability-registry): resolves a
   * concept to the one capability currently answering it, whole — read
   * through the store on every call, never remembered — answering the
   * absence as data where no held capability answers the concept, and
   * refusing a holding that answers it more than once rather than choosing
   * among the answers: the lookup is one to one, with no fallback chain
   * (rules/integration/one-capability-answers-one-concept).
   */
  public async readCapability(concept: string): Promise<CapabilityResolution> {
    const held = await this.store.readCapabilities();
    const answers = held.filter((candidate) => candidate.concept === concept);
    if (answers.length > 1) {
      throw new DuplicateConceptAnswerError(concept, answers);
    }
    const capability = answers[0];
    return capability === undefined ? { held: false, concept } : { held: true, capability };
  }

  /**
   * read-capability-by-identity (contracts/integration/capability-registry,
   * task/connector-diagnostics/test-connector-route): resolves one
   * capability by its own identity — name and version
   * (domain/integration/capability's own "identified by name and version")
   * — read through the store on every call, never remembered. Part of the
   * published capability-registry contract alongside read-capability, by
   * concept, list-capabilities and register-capability: a second read this
   * service offers for a consumer that already holds a capability's own
   * identity rather than the concept it answers, the same "absence stated
   * as data, never an error" shape readCapability already gives.
   */
  public async readCapabilityByIdentity(name: string, version: string): Promise<CapabilityIdentityResolution> {
    const held = await this.store.readCapabilities();
    const capability = held.find((candidate) => candidate.name === name && candidate.version === version);
    return capability === undefined ? { held: false, name, version } : { held: true, capability };
  }

  /**
   * read-capability-by-identity's own service-level wrapper
   * (constraints/the-capability-identity-read-refuses-an-unregistered-identity):
   * resolves through readCapabilityByIdentity above and raises
   * CapabilityIdentityNotFoundError once it has read that method's own
   * `held: false` answer, rather than leaving that held-check-and-throw to
   * read-capability-by-identity.controller.ts's own
   * handleReadCapabilityByIdentityRequest — the relocation
   * task/registry-read-not-found-relocation-and-rate-limit/capability-not-found-relocation
   * makes. Called only from that one route's own dependencies wiring
   * (build-app.factory.ts's own composeResources); readCapabilityByIdentity
   * above is unchanged in signature and keeps answering the miss as
   * ordinary data for every other consumer that reads it directly —
   * test-connector.controller.ts's own resolveTestedCapability among
   * them — so none of them is forced through this class.
   */
  public async readCapabilityByIdentityOrThrow(name: string, version: string): Promise<Capability> {
    const resolution = await this.readCapabilityByIdentity(name, version);
    if (!resolution.held) {
      throw new CapabilityIdentityNotFoundError(resolution.name, resolution.version);
    }
    return resolution.capability;
  }

  /**
   * list-capabilities (contracts/integration/capability-registry): every
   * capability currently registered, whole — read through the store on
   * every call, never remembered — paginated per src/types/pagination.ts.
   * The store answers every registration it holds in one read with no
   * pagination of its own (capability-store.port.ts's own readCapabilities),
   * so the offset/limit window and the total are both computed here, in
   * memory, over that full array — the same approach
   * list-vocabulary-terms-query-extension takes for the glossary's own
   * stores, which paginate no differently. A registry holding no
   * capabilities answers the same way: slicing an empty array yields an
   * empty page (data: [], total: 0), never an error.
   */
  public async listCapabilities(pagination: PaginationRequest): Promise<PaginatedResponse<Capability>> {
    const held = await this.store.readCapabilities();
    const total = held.length;
    const data = held.slice(pagination.offset, pagination.offset + pagination.limit);
    return {
      data,
      total,
      limit: pagination.limit,
      offset: pagination.offset,
      pageCount: pageCountOf(total, pagination.limit),
    };
  }
}

/** A registration that declared every required attribute, as the type then knows it. */
type DeclaredRegistration = CapabilityRegistration & {
  readonly name: string;
  readonly version: string;
  readonly nature: string;
  readonly input_schema: string;
  readonly output_schema: string;
  readonly connector: string;
  readonly concept: string;
};

/**
 * Holds one registration to the declared contract, refusing what departs
 * from it, and answers the capability as the registry will hold it.
 */
function heldCapability(registration: CapabilityRegistration): Capability {
  refuseContractDepartures(registration);
  refuseMalformedSchemas(registration);
  refuseMalformedInputSchemaShape(registration);
  if (registration.nature !== READ_ONLY_NATURE) {
    throw new CapabilityNotReadOnlyError(registration.nature);
  }
  return {
    name: registration.name,
    version: registration.version,
    nature: registration.nature,
    input_schema: registration.input_schema,
    output_schema: registration.output_schema,
    timeout: registration.timeout ?? DEFAULT_CAPABILITY_TIMEOUT_MS,
    connector: registration.connector,
    concept: registration.concept,
  };
}

/**
 * Refuses a registration leaving a required attribute undeclared
 * (rules/integration/a-capability-declares-its-contract's own "an attribute
 * that is absent or an empty string is undeclared"). A declared-but-malformed
 * timeout — present, but not an integer count of milliseconds, or an integer
 * that is zero or less — is not undeclared by that same wording, so neither
 * boundary ever reaches this refusal
 * (task/capability-timeout-contract-refusal/non-integer-timeout-refusal;
 * rules/integration/a-capability-declares-its-contract's own "a timeout of
 * zero or less bounds nothing ... so a stated timeout is refused the same
 * way a non-integer one already is"): registerCapabilityBodySchema's own
 * timeout: z.number().int().positive() already refuses both at the route's
 * declared shape, with the system-wide HTTP 400 VALIDATION_ERROR response
 * (constraints/a-malformed-request-is-refused-with-a-validation-error),
 * before a request carrying one ever reaches this service.
 */
function refuseContractDepartures(
  registration: CapabilityRegistration,
): asserts registration is DeclaredRegistration {
  const problems = contractProblems(registration);
  if (problems.length > 0) {
    throw new IncompleteCapabilityContractError(problems);
  }
}

/** Every required attribute one registration leaves undeclared, by its own name. */
function contractProblems(registration: CapabilityRegistration): string[] {
  return REQUIRED_REGISTRATION_ATTRIBUTES.filter((attribute) => isUndeclared(registration[attribute])).map(
    (attribute) => `${attribute} is undeclared`,
  );
}

/** Whether one attribute of a registration was left undeclared — absent and empty alike, since an empty attribute declares nothing. */
function isUndeclared(value: string | undefined): boolean {
  return value === undefined || value === '';
}

/**
 * Refuses a registration whose input schema or output schema is not
 * syntactically valid JSON (rules/integration/a-capability-declares-well-formed-schemas),
 * once the contract-completeness refusal above has already confirmed both
 * are declared, non-empty strings.
 */
function refuseMalformedSchemas(registration: DeclaredRegistration): void {
  const malformed = SCHEMA_ATTRIBUTES.filter((attribute) => !isWellFormedJson(registration[attribute]));
  if (malformed.length > 0) {
    throw new CapabilitySchemaNotWellFormedError(malformed);
  }
}

/** Whether one schema attribute's declared value parses as syntactically valid JSON. */
function isWellFormedJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Refuses a registration whose input schema, once refuseMalformedSchemas
 * above already confirmed it is syntactically valid JSON, does not hold the
 * declared shape — a top-level properties object, and, where declared, a
 * required array that is a subset of properties' own keys
 * (rules/integration/a-capability-input-schema-holds-a-well-formed-object).
 * Reuses inputSchemaShapeProblems (capability-input-schema-shape.ts), the
 * same shared reader declaredInputSchemaShape answers a pre-existing
 * malformed input_schema through, rather than a second JSON-shape parser
 * (MNT-03). Every departure the input schema makes at once is named
 * together in one refusal.
 */
function refuseMalformedInputSchemaShape(registration: DeclaredRegistration): void {
  const parsed: unknown = JSON.parse(registration.input_schema);
  const problems = inputSchemaShapeProblems(parsed);
  if (problems.length > 0) {
    throw new MalformedCapabilityInputSchemaError(problems);
  }
}

/**
 * The page count this limit divides total into (API-03) — 0 for a
 * non-positive limit, since dividing by it would answer no page count a
 * caller could page through at all. constraints/listings-are-paged now
 * states this branch is never reached by a request this system answers: "no
 * request with a non-positive limit reaches the count, because
 * a-malformed-request-is-refused-with-a-validation-error refuses it first"
 * — so the 0 this function answers for that case is this service's own
 * defensive floor for a call the constraint says never happens, the same
 * inference relational-case-store.repository.ts's own pageCountOf already
 * made for the store-paginated listings.
 *
 * Restated here rather than imported (MNT-03 divergence, disclosed): that
 * pageCountOf is a private, unexported function of an unrelated persistence
 * module, and glossary.service.ts's own listVocabularyTerms/listConcepts
 * already made the identical choice for the identical reason — exporting it
 * across a persistence-to-domain boundary, or lifting it into a new shared
 * module, is a change this task's own file set does not reach and would
 * widen it beyond what list-capabilities-query-extension was cut to do.
 */
function pageCountOf(total: number, limit: number): number {
  return limit > 0 ? Math.ceil(total / limit) : 0;
}

/** Whether two registrations name one capability, identified by name and version (domain/integration/capability). */
function sameIdentity(held: Capability, registered: Capability): boolean {
  return held.name === registered.name && held.version === registered.version;
}

/**
 * Refuses a registration naming a concept a different capability already
 * answers, before anything is written: each concept resolves to exactly one
 * capability, one to one, with no fallback chain until a second source of
 * the same concept exists
 * (rules/integration/one-capability-answers-one-concept). The kept records
 * exclude the registering identity, so a re-registration under an
 * already-held name and version still replaces its own record.
 */
function refuseAnsweredConcept(kept: readonly Capability[], registering: Capability): void {
  const answering = kept.find((candidate) => candidate.concept === registering.concept);
  if (answering !== undefined) {
    throw new ConceptAlreadyAnsweredError(registering.concept, answering, registering);
  }
}
