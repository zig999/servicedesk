import { CapabilityNotReadOnlyError } from '../errors/capability-not-read-only.error.js';
import { ConceptAlreadyAnsweredError } from '../errors/concept-already-answered.error.js';
import { DuplicateConceptAnswerError } from '../errors/duplicate-concept-answer.error.js';
import { IncompleteCapabilityContractError } from '../errors/incomplete-capability-contract.error.js';
import type { CapabilityResolution, ICapabilityQuery } from './capability-query.port.js';
import type { ICapabilityStore } from './capability-store.port.js';
import {
  DEFAULT_CAPABILITY_TIMEOUT_MS,
  READ_ONLY_NATURE,
  REQUIRED_REGISTRATION_ATTRIBUTES,
  type Capability,
  type CapabilityRegistration,
} from './capability.js';

/**
 * The registry's two operations (domain/integration/capability-registry):
 * register-capability holds every registration to the declared contract —
 * only read-only registers, a registration lacking its contract is refused,
 * and a concept a different capability already answers is refused
 * (rules/integration/one-capability-answers-one-concept) — before anything
 * is written; resolve-concept is the one lookup from a concept to the
 * capability that answers it, provided as the published capability-registry
 * contract, so a consumer holding ICapabilityQuery reads the registry
 * without depending on this class or its store. Persistence reaches it only
 * through the store port, so this module stays importable without any
 * infrastructure.
 */
export class CapabilityRegistryService implements ICapabilityQuery {
  public constructor(private readonly store: ICapabilityStore) {}

  /**
   * register-capability: refuses a registration that does not declare its
   * contract completely (rules/integration/a-capability-declares-its-contract),
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
 * Refuses a registration that departs from the declared contract: a required
 * attribute left undeclared, or a stated timeout that is not the integer
 * count of milliseconds the capability element declares.
 */
function refuseContractDepartures(
  registration: CapabilityRegistration,
): asserts registration is DeclaredRegistration {
  const problems = contractProblems(registration);
  if (problems.length > 0) {
    throw new IncompleteCapabilityContractError(problems);
  }
}

/** Every way one registration departs from the declared contract, in the attributes' own names. */
function contractProblems(registration: CapabilityRegistration): string[] {
  const problems = REQUIRED_REGISTRATION_ATTRIBUTES.filter((attribute) =>
    isUndeclared(registration[attribute]),
  ).map((attribute) => `${attribute} is undeclared`);
  if (registration.timeout !== undefined && !Number.isInteger(registration.timeout)) {
    problems.push('timeout is not an integer count of milliseconds');
  }
  return problems;
}

/** Whether one attribute of a registration was left undeclared — absent and empty alike, since an empty attribute declares nothing. */
function isUndeclared(value: string | undefined): boolean {
  return value === undefined || value === '';
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
