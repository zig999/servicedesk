// Proof for the registry's refusing half: only a complete read-only contract
// registers — a nature that is not read-only is refused, an undeclared
// required attribute is refused by name, an unstated timeout takes the
// default of sixty seconds held as 60000 milliseconds, and a re-registration
// under a held name and version replaces the record it holds. The store
// boundary is an in-memory stand-in, so no test here touches a file.
import { expect, it } from 'vitest';
import { CapabilityRegistryService } from '../../../capability-registry/capability-registry.service.js';
import type { ICapabilityStore } from '../../../capability-registry/capability-store.port.js';
import type { Capability, CapabilityRegistration } from '../../../capability-registry/capability.js';
import { CapabilityNotReadOnlyError } from '../../../errors/capability-not-read-only.error.js';
import { IncompleteCapabilityContractError } from '../../../errors/incomplete-capability-contract.error.js';

/**
 * The default the criterion states as sixty seconds, spelled here in the
 * specification's own unit — the capability element declares its timeout in
 * milliseconds — rather than imported from the source, so the test fails if
 * the source's constant drifts from what the task states.
 */
const SIXTY_SECONDS_IN_MILLISECONDS = 60_000;

/** A stated timeout for registrations that declare one, so the default is visible where it applies. */
const STATED_TIMEOUT_MS = 5_000;

/** The one nature that registers, spelled here rather than imported so a drift in the source fails. */
const READ_ONLY = 'read-only';

/** Stands in for the store boundary, so the service is exercised without any filesystem. */
class InMemoryCapabilityStore implements ICapabilityStore {
  public constructor(private records: readonly Capability[] = []) {}

  public async readCapabilities(): Promise<readonly Capability[]> {
    return this.records;
  }

  public async writeCapabilities(capabilities: readonly Capability[]): Promise<void> {
    this.records = capabilities;
  }

  /** What the store now holds, for asserting what a registration persisted. */
  public held(): readonly Capability[] {
    return this.records;
  }
}

/** A capability as the registry would already hold it, for seeding the stand-in store. */
function heldCapability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: 'a-capability',
    version: '1.0.0',
    nature: READ_ONLY,
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: STATED_TIMEOUT_MS,
    connector: 'a-connector',
    concept: 'a-concept',
    ...overrides,
  };
}

/** A registration declaring the whole contract, for tests to depart from one attribute at a time. */
function completeRegistration(overrides: CapabilityRegistration = {}): CapabilityRegistration {
  return { ...heldCapability(), ...overrides };
}

/** Which attributes an incomplete-contract refusal names, read from the refusal's own problems. */
function namedAttributes(refusal: unknown): string[] {
  if (!(refusal instanceof IncompleteCapabilityContractError)) {
    throw new Error('expected the incomplete-contract refusal, got something else');
  }
  return refusal.context.problems.map((problem) => problem.split(' ')[0]);
}

it('refuses a registration whose nature is mutating', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(completeRegistration({ nature: 'mutating' }))
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(CapabilityNotReadOnlyError);
  expect(refusal).toMatchObject({ context: { nature: 'mutating' } });
});

it('writes nothing to the store when it refuses a registration', async () => {
  const alreadyHeld = heldCapability();
  const store = new InMemoryCapabilityStore([alreadyHeld]);
  const registry = new CapabilityRegistryService(store);

  await registry.registerCapability(completeRegistration({ nature: 'mutating' })).catch(() => undefined);

  expect(store.held()).toEqual([alreadyHeld]);
});

it('refuses a registration that declares no input schema, naming the attribute', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(completeRegistration({ input_schema: undefined }))
    .catch((error: unknown) => error);

  expect(namedAttributes(refusal)).toEqual(['input_schema']);
});

it('refuses a registration that declares no output schema, naming the attribute', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(completeRegistration({ output_schema: undefined }))
    .catch((error: unknown) => error);

  expect(namedAttributes(refusal)).toEqual(['output_schema']);
});

it('refuses a registration that declares no connector, naming the attribute', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(completeRegistration({ connector: undefined }))
    .catch((error: unknown) => error);

  expect(namedAttributes(refusal)).toEqual(['connector']);
});

it('refuses a registration that declares no name', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(completeRegistration({ name: undefined }))
    .catch((error: unknown) => error);

  expect(namedAttributes(refusal)).toEqual(['name']);
});

it('refuses a registration that declares no version', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(completeRegistration({ version: undefined }))
    .catch((error: unknown) => error);

  expect(namedAttributes(refusal)).toEqual(['version']);
});

it('refuses a registration that declares no concept', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(completeRegistration({ concept: undefined }))
    .catch((error: unknown) => error);

  expect(namedAttributes(refusal)).toEqual(['concept']);
});

it('refuses an empty registration naming every required attribute', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry.registerCapability({}).catch((error: unknown) => error);

  expect(namedAttributes(refusal).sort()).toEqual([
    'concept',
    'connector',
    'input_schema',
    'name',
    'nature',
    'output_schema',
    'version',
  ]);
});

it('treats an attribute declared as the empty string as undeclared', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(completeRegistration({ output_schema: '' }))
    .catch((error: unknown) => error);

  expect(namedAttributes(refusal)).toEqual(['output_schema']);
});

it('holds the default of sixty seconds, as 60000 milliseconds, for a registration that states no timeout', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const registered = await registry.registerCapability(completeRegistration({ timeout: undefined }));

  expect(registered.timeout).toBe(SIXTY_SECONDS_IN_MILLISECONDS);
});

it('passes a stated timeout through unchanged', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const registered = await registry.registerCapability(completeRegistration({ timeout: STATED_TIMEOUT_MS }));

  expect(registered.timeout).toBe(STATED_TIMEOUT_MS);
});

it('refuses a stated timeout that is not an integer count of milliseconds', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(completeRegistration({ timeout: 0.5 }))
    .catch((error: unknown) => error);

  expect(namedAttributes(refusal)).toEqual(['timeout']);
});

it('accepts a complete read-only contract and answers the capability as registered', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const registered = await registry.registerCapability(completeRegistration());

  expect(registered).toEqual({
    name: 'a-capability',
    version: '1.0.0',
    nature: READ_ONLY,
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: STATED_TIMEOUT_MS,
    connector: 'a-connector',
    concept: 'a-concept',
  });
});

it('persists an accepted registration through the store', async () => {
  const store = new InMemoryCapabilityStore();
  const registry = new CapabilityRegistryService(store);

  const registered = await registry.registerCapability(completeRegistration());

  expect(store.held()).toEqual([registered]);
});

it('replaces the held record when a held name and version register again', async () => {
  const store = new InMemoryCapabilityStore([heldCapability({ connector: 'an-old-connector' })]);
  const registry = new CapabilityRegistryService(store);

  await registry.registerCapability(completeRegistration({ connector: 'a-new-connector' }));

  expect(store.held()).toEqual([expect.objectContaining({ connector: 'a-new-connector' })]);
});

it('holds two versions of one capability name as two registrations', async () => {
  // Human-settled amendment: the versions answer different concepts, because
  // rules/integration/one-capability-answers-one-concept refuses one concept
  // resolving to two capabilities — what this test proves (identity is name
  // and version together) is untouched by the fixture change.
  const store = new InMemoryCapabilityStore([heldCapability({ version: '1.0.0' })]);
  const registry = new CapabilityRegistryService(store);

  await registry.registerCapability(
    completeRegistration({ version: '2.0.0', concept: 'another-concept' }),
  );

  expect(store.held().map((held) => held.version).sort()).toEqual(['1.0.0', '2.0.0']);
});
