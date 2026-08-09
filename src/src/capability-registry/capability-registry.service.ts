import { CapabilityNotReadOnlyError } from '../errors/capability-not-read-only.error.js';
import { IncompleteCapabilityContractError } from '../errors/incomplete-capability-contract.error.js';
import type { ICapabilityStore } from './capability-store.port.js';
import {
  DEFAULT_CAPABILITY_TIMEOUT_MS,
  READ_ONLY_NATURE,
  REQUIRED_REGISTRATION_ATTRIBUTES,
  type Capability,
  type CapabilityRegistration,
} from './capability.js';

/**
 * The registry's refusing half (domain/integration/capability-registry):
 * register-capability holds every registration to the declared contract —
 * only read-only registers, and a registration lacking its contract is
 * refused — before anything is written. Persistence reaches it only through
 * the store port, so this module stays importable without any infrastructure.
 */
export class CapabilityRegistryService {
  public constructor(private readonly store: ICapabilityStore) {}

  /**
   * register-capability: refuses a registration that does not declare its
   * contract completely (rules/integration/a-capability-declares-its-contract)
   * or whose nature is not read-only
   * (rules/integration/a-capability-is-read-only), before any write. The
   * rest is held — a re-registration under an already-held name and version
   * replacing the record it holds, since a capability is identified by name
   * and version — and answered as held, the timeout defaulted where the
   * registration stated none.
   */
  public async registerCapability(registration: CapabilityRegistration): Promise<Capability> {
    const capability = heldCapability(registration);
    const held = await this.store.readCapabilities();
    const kept = held.filter((candidate) => !sameIdentity(candidate, capability));
    await this.store.writeCapabilities([...kept, capability]);
    return capability;
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
