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
import { CapabilityIdentityNotFoundError } from '../../../errors/capability-identity-not-found.error.js';
import { CapabilityNotReadOnlyError } from '../../../errors/capability-not-read-only.error.js';
import { CapabilitySchemaNotWellFormedError } from '../../../errors/capability-schema-not-well-formed.error.js';
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
    input_schema: '{}',
    output_schema: '{}',
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

// A stated, non-integer timeout is no longer refused at this level
// (task/capability-timeout-contract-refusal/non-integer-timeout-refusal):
// rules/integration/a-capability-declares-its-contract's own wording limits
// "undeclared" — the only case this service's contract-completeness refusal
// covers — to an absent or empty-string value, and a present, non-integer
// value is neither. The refusal for it now lives at the route's own
// validation layer (register-capability.dto.ts's timeout:z.number().int()),
// which a call straight into the service, as this test makes, never passes
// through — so this direct call now succeeds.
it('accepts a stated timeout that is not an integer count of milliseconds, holding it through unchanged, since a present value is never "undeclared"', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const registered = await registry.registerCapability(completeRegistration({ timeout: 0.5 }));

  expect(registered.timeout).toBe(0.5);
});

it('accepts a complete read-only contract and answers the capability as registered', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const registered = await registry.registerCapability(completeRegistration());

  expect(registered).toEqual({
    name: 'a-capability',
    version: '1.0.0',
    nature: READ_ONLY,
    input_schema: '{}',
    output_schema: '{}',
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

// ------------------------------------------------------------------ schema well-formedness
// Proof for task/capability-authoring/register-capability-route (criterion 3,
// rules/integration/a-capability-declares-well-formed-schemas): the registry
// now refuses a registration whose input_schema or output_schema is not
// syntactically valid JSON, before the concept-answered check and before any
// write — added alongside the three refusals above. This fixture file's own
// completeRegistration()/heldCapability() default input_schema and
// output_schema to '{}', syntactically valid but semantically empty, so every
// test below overrides both attributes explicitly to exercise the
// well-formed/malformed distinction rather than relying on that default.

/** A syntactically valid JSON document, minimal on purpose — well-formedness is JSON.parse succeeding, never a JSON Schema shape. */
const WELL_FORMED_SCHEMA = '{"type":"object"}';

it('refuses a registration whose input_schema is not syntactically valid JSON, naming the attribute', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(
      completeRegistration({ input_schema: '{not valid json', output_schema: WELL_FORMED_SCHEMA }),
    )
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(CapabilitySchemaNotWellFormedError);
  expect(refusal).toMatchObject({ context: { attributes: ['input_schema'] } });
});

it('refuses a registration whose output_schema is not syntactically valid JSON, naming the attribute', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(
      completeRegistration({ input_schema: WELL_FORMED_SCHEMA, output_schema: '{not valid json' }),
    )
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(CapabilitySchemaNotWellFormedError);
  expect(refusal).toMatchObject({ context: { attributes: ['output_schema'] } });
});

it('refuses a registration whose input_schema and output_schema are both not syntactically valid JSON, naming both attributes', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(
      completeRegistration({ input_schema: '{not valid', output_schema: '{also not valid' }),
    )
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(CapabilitySchemaNotWellFormedError);
  expect(refusal).toMatchObject({ context: { attributes: ['input_schema', 'output_schema'] } });
});

it('writes nothing to the store when it refuses a registration for a malformed schema', async () => {
  const alreadyHeld = heldCapability({ input_schema: WELL_FORMED_SCHEMA, output_schema: WELL_FORMED_SCHEMA });
  const store = new InMemoryCapabilityStore([alreadyHeld]);
  const registry = new CapabilityRegistryService(store);

  await registry
    .registerCapability(completeRegistration({ input_schema: '{not valid', output_schema: WELL_FORMED_SCHEMA }))
    .catch(() => undefined);

  expect(store.held()).toEqual([alreadyHeld]);
});

it('accepts a registration whose input_schema and output_schema are syntactically valid JSON, holding both unchanged', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const registered = await registry.registerCapability(
    completeRegistration({ input_schema: WELL_FORMED_SCHEMA, output_schema: '{"type":"string"}' }),
  );

  expect(registered.input_schema).toBe(WELL_FORMED_SCHEMA);
  expect(registered.output_schema).toBe('{"type":"string"}');
});

// ------------------------------------------------------------------ list-capabilities
// Proof for task/capability-registry-http/list-capabilities-query-extension:
// every capability currently registered, whole with its full declared
// contract, paginated per src/types/pagination.ts and
// standards/backend-node-service.yaml's API-01 through API-03 — the store's
// own readCapabilities answers no pagination of its own, so the offset/limit
// window, the total and the page count are all computed here, in memory.

it('returns every capability currently registered, whole with its full declared contract, in one page', async () => {
  const first = heldCapability();
  const second = heldCapability({
    name: 'another-capability',
    version: '2.0.0',
    input_schema: 'another-input-schema',
    output_schema: 'another-output-schema',
    connector: 'another-connector',
    concept: 'another-concept',
  });
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore([first, second]));

  const page = await registry.listCapabilities({ offset: 0, limit: 10 });

  expect(page).toEqual({
    data: [first, second],
    total: 2,
    limit: 10,
    offset: 0,
    pageCount: 1,
  });
});

it('answers a registry holding no capabilities with an empty page rather than an error', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore([]));

  const page = await registry.listCapabilities({ offset: 0, limit: 10 });

  expect(page).toEqual({ data: [], total: 0, limit: 10, offset: 0, pageCount: 0 });
});

it('windows a page from the middle of a larger set, not just the first page', async () => {
  const capabilities = [0, 1, 2, 3, 4].map((index) =>
    heldCapability({ name: `capability-${index}`, concept: `concept-${index}` }),
  );
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(capabilities));

  const page = await registry.listCapabilities({ offset: 2, limit: 2 });

  expect(page.data).toEqual([capabilities[2], capabilities[3]]);
  expect(page.total).toBe(5);
});

it('answers an empty data array, never an error, when the offset falls past the end of the registered capabilities', async () => {
  const capabilities = [0, 1, 2].map((index) =>
    heldCapability({ name: `capability-${index}`, concept: `concept-${index}` }),
  );
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(capabilities));

  const page = await registry.listCapabilities({ offset: 10, limit: 2 });

  expect(page).toEqual({ data: [], total: 3, limit: 2, offset: 10, pageCount: 2 });
});

it('computes the page count as the ceiling of total over limit when they do not divide evenly', async () => {
  const capabilities = [0, 1, 2, 3, 4].map((index) =>
    heldCapability({ name: `capability-${index}`, concept: `concept-${index}` }),
  );
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(capabilities));

  const page = await registry.listCapabilities({ offset: 0, limit: 2 });

  expect(page.pageCount).toBe(3);
});

it('computes the page count exactly when total divides evenly by limit, adding no spurious page', async () => {
  const capabilities = [0, 1, 2, 3].map((index) =>
    heldCapability({ name: `capability-${index}`, concept: `concept-${index}` }),
  );
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(capabilities));

  const page = await registry.listCapabilities({ offset: 0, limit: 2 });

  expect(page.pageCount).toBe(2);
});

it('answers a page count of zero for a non-positive limit rather than dividing by it', async () => {
  const capabilities = [0, 1, 2].map((index) =>
    heldCapability({ name: `capability-${index}`, concept: `concept-${index}` }),
  );
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(capabilities));

  const page = await registry.listCapabilities({ offset: 0, limit: 0 });

  expect(page).toEqual({ data: [], total: 3, limit: 0, offset: 0, pageCount: 0 });
});

it('reads the store on every call, answering a capability registered since the previous list rather than a remembered one', async () => {
  const store = new InMemoryCapabilityStore([heldCapability()]);
  const registry = new CapabilityRegistryService(store);
  await registry.listCapabilities({ offset: 0, limit: 10 }); // answers one capability, baiting a memory
  await store.writeCapabilities([
    heldCapability(),
    heldCapability({ name: 'another-capability', concept: 'another-concept' }),
  ]);

  const page = await registry.listCapabilities({ offset: 0, limit: 10 });

  expect(page.total).toBe(2);
});

// ------------------------------------------------------------------ read-capability-by-identity's own service-level wrapper
// Proof for task/registry-read-not-found-relocation-and-rate-limit/capability-not-found-relocation:
// readCapabilityByIdentityOrThrow's own two branches, plus proof that the raw readCapabilityByIdentity
// it wraps keeps answering a miss — and a hit — as ordinary data rather than ever throwing itself
// (criterion 3): its existing signature and held-false data-returning resolution are untouched by
// the relocation.

it('answers the held capability directly, with no resolution wrapper, when one is currently registered under the named identity', async () => {
  const capability = heldCapability({ name: 'a-known-capability', version: '2.0.0' });
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore([capability]));

  const resolved = await registry.readCapabilityByIdentityOrThrow('a-known-capability', '2.0.0');

  expect(resolved).toEqual(capability);
});

it('throws CapabilityIdentityNotFoundError carrying the requested name and version when nothing is registered under that identity', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .readCapabilityByIdentityOrThrow('an-absent-capability', '9.9.9')
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(CapabilityIdentityNotFoundError);
  expect(refusal).toMatchObject({ context: { name: 'an-absent-capability', version: '9.9.9' } });
});

it('propagates a failure the underlying store read itself raises, rather than reporting it as CapabilityIdentityNotFoundError', async () => {
  const failingStore: ICapabilityStore = {
    readCapabilities: async () => {
      throw new Error('the store is unavailable');
    },
    writeCapabilities: async () => undefined,
  };
  const registry = new CapabilityRegistryService(failingStore);

  const outcome = await registry
    .readCapabilityByIdentityOrThrow('a-capability', '1.0.0')
    .catch((error: unknown) => error);

  expect(outcome).toBeInstanceOf(Error);
  expect(outcome).not.toBeInstanceOf(CapabilityIdentityNotFoundError);
  expect((outcome as Error).message).toBe('the store is unavailable');
});

it("readCapabilityByIdentity itself still answers an unregistered identity as ordinary held-false data, never throwing, unaffected by the wrapper's own relocation", async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const resolution = await registry.readCapabilityByIdentity('an-absent-capability', '9.9.9');

  expect(resolution).toEqual({ held: false, name: 'an-absent-capability', version: '9.9.9' });
});

it('readCapabilityByIdentity itself still answers a currently held identity as { held: true, capability }, unaffected by the wrapper', async () => {
  const capability = heldCapability({ name: 'a-known-capability', version: '2.0.0' });
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore([capability]));

  const resolution = await registry.readCapabilityByIdentity('a-known-capability', '2.0.0');

  expect(resolution).toEqual({ held: true, capability });
});
