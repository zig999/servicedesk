import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { CapabilityRegistryService } from '../../../capability-registry/capability-registry.service.js';
import type { ICapabilityStore } from '../../../capability-registry/capability-store.port.js';
import type { Capability, CapabilityRegistration } from '../../../capability-registry/capability.js';
import type {
  IConnectorConfigurationsReader,
  RegisteredConnectorConfigurationForPlaceholderCheck,
} from '../../../capability-registry/connector-configurations-reader.port.js';
import { CapabilityIdentityNotFoundError } from '../../../errors/capability-identity-not-found.error.js';
import { CapabilityNotReadOnlyError } from '../../../errors/capability-not-read-only.error.js';
import { CapabilitySchemaNotWellFormedError } from '../../../errors/capability-schema-not-well-formed.error.js';
import { ConceptAlreadyAnsweredError } from '../../../errors/concept-already-answered.error.js';
import { ConnectorPlaceholderOutsideInputSchemaError } from '../../../errors/connector-placeholder-outside-input-schema.error.js';
import { IncompleteCapabilityContractError } from '../../../errors/incomplete-capability-contract.error.js';
import { MalformedCapabilityInputSchemaError } from '../../../errors/malformed-capability-input-schema.error.js';

const SIXTY_SECONDS_IN_MILLISECONDS = 60_000;

const STATED_TIMEOUT_MS = 5_000;

const READ_ONLY = 'read-only';

class InMemoryCapabilityStore implements ICapabilityStore {
  public constructor(private records: readonly Capability[] = []) {}

  public async readCapabilities(): Promise<readonly Capability[]> {
    return this.records;
  }

  public async writeCapabilities(capabilities: readonly Capability[]): Promise<void> {
    this.records = capabilities;
  }

  public held(): readonly Capability[] {
    return this.records;
  }
}

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

function completeRegistration(overrides: CapabilityRegistration = {}): CapabilityRegistration {
  return { ...heldCapability(), ...overrides };
}

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

  const store = new InMemoryCapabilityStore([heldCapability({ version: '1.0.0' })]);
  const registry = new CapabilityRegistryService(store);

  await registry.registerCapability(
    completeRegistration({ version: '2.0.0', concept: 'another-concept' }),
  );

  expect(store.held().map((held) => held.version).sort()).toEqual(['1.0.0', '2.0.0']);
});

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

it('refuses a registration whose input_schema declares properties as something other than an object, reporting MalformedCapabilityInputSchemaError', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(completeRegistration({ input_schema: '{"properties":"not-an-object"}' }))
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(MalformedCapabilityInputSchemaError);
  expect(refusal).toMatchObject({ context: { problems: ['properties is not declared as an object'] } });
});

it('refuses a registration whose input_schema declares a required array naming a key absent from properties, reporting MalformedCapabilityInputSchemaError', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(
      completeRegistration({ input_schema: '{"properties":{"a":{}},"required":["a","b"]}' }),
    )
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(MalformedCapabilityInputSchemaError);
  expect(refusal).toMatchObject({
    context: { problems: ['required names a key absent from properties: b'] },
  });
});

it('refuses a registration whose input_schema departs from the shape in more than one way with one MalformedCapabilityInputSchemaError naming every departure together', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const refusal = await registry
    .registerCapability(
      completeRegistration({ input_schema: '{"properties":"not-an-object","required":["a"]}' }),
    )
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(MalformedCapabilityInputSchemaError);
  expect(refusal).toMatchObject({
    context: {
      problems: [
        'properties is not declared as an object',
        'required names a key absent from properties: a',
      ],
    },
  });
});

it('writes nothing to the store when it refuses a registration for a malformed input schema shape', async () => {
  const alreadyHeld = heldCapability({ input_schema: WELL_FORMED_SCHEMA, output_schema: WELL_FORMED_SCHEMA });
  const store = new InMemoryCapabilityStore([alreadyHeld]);
  const registry = new CapabilityRegistryService(store);

  await registry
    .registerCapability(completeRegistration({ input_schema: '{"properties":"not-an-object"}' }))
    .catch(() => undefined);

  expect(store.held()).toEqual([alreadyHeld]);
});

it('accepts a registration whose input_schema declares an empty properties object and no required array', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const registered = await registry.registerCapability(
    completeRegistration({ input_schema: '{"properties":{}}' }),
  );

  expect(registered.input_schema).toBe('{"properties":{}}');
});

it('accepts a registration whose input_schema declares no properties key at all, reading the omission as declaring it empty rather than refusing it as a shape departure', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const registered = await registry.registerCapability(completeRegistration({ input_schema: '{}' }));

  expect(registered.input_schema).toBe('{}');
});

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
  await registry.listCapabilities({ offset: 0, limit: 10 });
  await store.writeCapabilities([
    heldCapability(),
    heldCapability({ name: 'another-capability', concept: 'another-concept' }),
  ]);

  const page = await registry.listCapabilities({ offset: 0, limit: 10 });

  expect(page.total).toBe(2);
});

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

function proseOf(source: string): string {
  return source
    .split('\n')
    .map((line) => line.replace(/^\s*(\/\*\*|\*\/|\*|\/\/)\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

it("readCapabilityByIdentity's own comment states the operation is part of the published capability-registry contract, not outside it (criterion 2)", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../capability-registry/capability-registry.service.ts', import.meta.url)), 'utf8');
  const prose = proseOf(source);

  expect(prose).not.toMatch(/outside (?:the|this) (?:published )?capability-registry contract/i);
  expect(prose).toContain(
    'Part of the published capability-registry contract alongside read-capability, by concept, list-capabilities and register-capability',
  );
});

it("pageCountOf's own comment cites constraints/listings-are-paged's own statement that a non-positive limit never reaches this count, rather than claiming no source states the answer (criterion 6)", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../capability-registry/capability-registry.service.ts', import.meta.url)), 'utf8');
  const prose = proseOf(source);

  expect(prose).not.toMatch(/no source states/i);
  expect(prose).toContain('constraints/listings-are-paged now states this branch is never reached by a request this system answers');
  expect(prose).toContain(
    'no request with a non-positive limit reaches the count, because a-malformed-request-is-refused-with-a-validation-error refuses it first',
  );
});

it("refuseContractDepartures' own doc comment describes both the non-integer and the non-positive timeout boundaries, and cites the schema's actual shape rather than z.number().int() alone", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../capability-registry/capability-registry.service.ts', import.meta.url)), 'utf8');
  const prose = proseOf(source);

  expect(prose).not.toContain('z.number().int() alone');
  expect(prose).toContain('not an integer count of milliseconds, or an integer that is zero or less');
  expect(prose).toContain('a timeout of zero or less bounds nothing');
  expect(prose).toContain("registerCapabilityBodySchema's own timeout: z.number().int().positive()");
});

it('answers every connector configuration the injected reader currently holds, exactly as that reader answers it', async () => {
  const registeredConfigurations = [
    { connector: 'a-connector', configuration: '{"address":"https://a.example.test"}' },
    { connector: 'another-connector', configuration: '{"address":"https://b.example.test"}' },
  ];
  const reader: IConnectorConfigurationsReader = {
    readConnectorConfigurations: async () => registeredConfigurations,
  };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), reader);

  const answered = await registry.readRegisteredConnectorConfigurations();

  expect(answered).toEqual(registeredConfigurations);
});

it('answers the empty array from readRegisteredConnectorConfigurations when constructed with no connector-configurations reader at all', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const answered = await registry.readRegisteredConnectorConfigurations();

  expect(answered).toEqual([]);
});

it('propagates a failure the injected connector-configurations reader itself raises, rather than swallowing it', async () => {
  const failingReader: IConnectorConfigurationsReader = {
    readConnectorConfigurations: async () => {
      throw new Error('the connector-configuration store is unavailable');
    },
  };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), failingReader);

  const outcome = await registry.readRegisteredConnectorConfigurations().catch((error: unknown) => error);

  expect(outcome).toBeInstanceOf(Error);
  expect((outcome as Error).message).toBe('the connector-configuration store is unavailable');
});

function registeredConfiguration(
  overrides: Partial<RegisteredConnectorConfigurationForPlaceholderCheck> = {},
): RegisteredConnectorConfigurationForPlaceholderCheck {
  return {
    connector: 'erp-http',
    configuration: '{"address":"https://api.example.test/records"}',
    ...overrides,
  };
}

it('refuses a registration naming a connector that already holds a registered configuration embedding a Subject-attribute placeholder its own input_schema properties does not declare, as ConnectorPlaceholderOutsideInputSchemaError', async () => {
  const configuration = registeredConfiguration({
    configuration: '{"address":"https://api.example.test/records/${subject:customer_document}"}',
  });
  const reader: IConnectorConfigurationsReader = { readConnectorConfigurations: async () => [configuration] };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), reader);

  const refusal = await registry
    .registerCapability(
      completeRegistration({ connector: 'erp-http', input_schema: '{"properties":{"contract_number":{}}}' }),
    )
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConnectorPlaceholderOutsideInputSchemaError);
});

it('writes nothing to the store when it refuses a registration for an orphaned placeholder', async () => {
  const configuration = registeredConfiguration({ configuration: '{"address":"${subject:customer_document}"}' });
  const reader: IConnectorConfigurationsReader = { readConnectorConfigurations: async () => [configuration] };
  const alreadyHeld = heldCapability({ connector: 'an-unrelated-connector' });
  const store = new InMemoryCapabilityStore([alreadyHeld]);
  const registry = new CapabilityRegistryService(store, reader);

  await registry
    .registerCapability(completeRegistration({ connector: 'erp-http', input_schema: '{"properties":{}}' }))
    .catch(() => undefined);

  expect(store.held()).toEqual([alreadyHeld]);
});

it('names the orphaned placeholder together with the capability being registered', async () => {
  const configuration = registeredConfiguration({
    configuration: '{"address":"https://api.example.test/records/${subject:customer_document}"}',
  });
  const reader: IConnectorConfigurationsReader = { readConnectorConfigurations: async () => [configuration] };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), reader);

  const refusal = await registry
    .registerCapability(
      completeRegistration({ connector: 'erp-http', input_schema: '{"properties":{"contract_number":{}}}' }),
    )
    .catch((error: unknown) => error);

  expect((refusal as ConnectorPlaceholderOutsideInputSchemaError).context.orphaned).toEqual([
    {
      placeholder: 'customer_document',
      capabilities: [{ connector: 'erp-http', input_schema: '{"properties":{"contract_number":{}}}' }],
    },
  ]);
});

it("names both orphaned placeholders together when the connector's registered configuration embeds two the registration does not declare", async () => {
  const configuration = registeredConfiguration({
    configuration: '{"a":"${subject:customer_document}","b":"${subject:policy_number}"}',
  });
  const reader: IConnectorConfigurationsReader = { readConnectorConfigurations: async () => [configuration] };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), reader);

  const refusal = await registry
    .registerCapability(completeRegistration({ connector: 'erp-http', input_schema: '{"properties":{}}' }))
    .catch((error: unknown) => error);

  const orphaned = [...(refusal as ConnectorPlaceholderOutsideInputSchemaError).context.orphaned].sort((a, b) =>
    a.placeholder.localeCompare(b.placeholder),
  );
  expect(orphaned).toEqual([
    { placeholder: 'customer_document', capabilities: [{ connector: 'erp-http', input_schema: '{"properties":{}}' }] },
    { placeholder: 'policy_number', capabilities: [{ connector: 'erp-http', input_schema: '{"properties":{}}' }] },
  ]);
});

it('names one orphaned placeholder once, not once per occurrence, when the registered configuration embeds it more than once', async () => {
  const configuration = registeredConfiguration({
    configuration: '{"a":"${subject:customer_document}","b":"${subject:customer_document}"}',
  });
  const reader: IConnectorConfigurationsReader = { readConnectorConfigurations: async () => [configuration] };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), reader);

  const refusal = await registry
    .registerCapability(completeRegistration({ connector: 'erp-http', input_schema: '{"properties":{}}' }))
    .catch((error: unknown) => error);

  expect((refusal as ConnectorPlaceholderOutsideInputSchemaError).context.orphaned).toEqual([
    { placeholder: 'customer_document', capabilities: [{ connector: 'erp-http', input_schema: '{"properties":{}}' }] },
  ]);
});

it('unions the orphaned placeholder across every registered configuration for the connector, named once even though only one of two configurations embeds it', async () => {
  const orphaning = registeredConfiguration({ configuration: '{"address":"${subject:customer_document}"}' });
  const notOrphaning = registeredConfiguration({
    configuration: '{"address":"https://api.example.test/records"}',
  });
  const reader: IConnectorConfigurationsReader = {
    readConnectorConfigurations: async () => [notOrphaning, orphaning],
  };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), reader);

  const refusal = await registry
    .registerCapability(completeRegistration({ connector: 'erp-http', input_schema: '{"properties":{}}' }))
    .catch((error: unknown) => error);

  expect((refusal as ConnectorPlaceholderOutsideInputSchemaError).context.orphaned).toEqual([
    { placeholder: 'customer_document', capabilities: [{ connector: 'erp-http', input_schema: '{"properties":{}}' }] },
  ]);
});

it('names the registering capability by exactly its connector and input_schema, in a one-element capabilities array, adding no wider identity of its own', async () => {
  const configuration = registeredConfiguration({ configuration: '{"address":"${subject:customer_document}"}' });
  const reader: IConnectorConfigurationsReader = { readConnectorConfigurations: async () => [configuration] };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), reader);

  const refusal = await registry
    .registerCapability(completeRegistration({ connector: 'erp-http', input_schema: '{"properties":{}}' }))
    .catch((error: unknown) => error);

  const [entry] = (refusal as ConnectorPlaceholderOutsideInputSchemaError).context.orphaned;
  expect(entry.capabilities).toHaveLength(1);
  expect(Object.keys(entry.capabilities[0]).sort()).toEqual(['connector', 'input_schema']);
});

it("succeeds when the registration's own input_schema properties declares the placeholder's attribute, even though the connector already holds a configuration embedding it", async () => {
  const configuration = registeredConfiguration({ configuration: '{"address":"${subject:customer_document}"}' });
  const reader: IConnectorConfigurationsReader = { readConnectorConfigurations: async () => [configuration] };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), reader);

  const registered = await registry.registerCapability(
    completeRegistration({ connector: 'erp-http', input_schema: '{"properties":{"customer_document":{}}}' }),
  );

  expect(registered.input_schema).toBe('{"properties":{"customer_document":{}}}');
});

it('is not refused by this check when the connector it names holds no registered configuration at all', async () => {
  const reader: IConnectorConfigurationsReader = { readConnectorConfigurations: async () => [] };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), reader);

  const registered = await registry.registerCapability(
    completeRegistration({ connector: 'erp-http', input_schema: '{"properties":{}}' }),
  );

  expect(registered.connector).toBe('erp-http');
});

it('is not refused by this check when every registered configuration names a different connector', async () => {
  const configuration = registeredConfiguration({
    connector: 'a-different-connector',
    configuration: '{"address":"${subject:customer_document}"}',
  });
  const reader: IConnectorConfigurationsReader = { readConnectorConfigurations: async () => [configuration] };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), reader);

  const registered = await registry.registerCapability(
    completeRegistration({ connector: 'erp-http', input_schema: '{"properties":{}}' }),
  );

  expect(registered.connector).toBe('erp-http');
});

it('succeeds when constructed with the default (no) connector-configurations reader, since every pre-existing single-argument construction of this class has no use for this capacity', async () => {
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore());

  const registered = await registry.registerCapability(completeRegistration());

  expect(registered.connector).toBe('a-connector');
});

it('refuses a registration missing a required attribute as IncompleteCapabilityContractError, even though the named connector already holds a configuration that would also embed an orphaned placeholder', async () => {
  const configuration = registeredConfiguration({ configuration: '{"address":"${subject:customer_document}"}' });
  const reader: IConnectorConfigurationsReader = { readConnectorConfigurations: async () => [configuration] };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), reader);

  const refusal = await registry
    .registerCapability(completeRegistration({ connector: 'erp-http', name: undefined }))
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(IncompleteCapabilityContractError);
  expect(refusal).not.toBeInstanceOf(ConnectorPlaceholderOutsideInputSchemaError);
});

it('refuses a registration whose connector holds an orphaning configuration as ConnectorPlaceholderOutsideInputSchemaError even though its concept is already answered by another capability, since this check runs before the concept-uniqueness refusal', async () => {
  const configuration = registeredConfiguration({ configuration: '{"address":"${subject:customer_document}"}' });
  const reader: IConnectorConfigurationsReader = { readConnectorConfigurations: async () => [configuration] };
  const alreadyAnswering = heldCapability({ name: 'another-capability', connector: 'erp-http', concept: 'a-concept' });
  const store = new InMemoryCapabilityStore([alreadyAnswering]);
  const registry = new CapabilityRegistryService(store, reader);

  const refusal = await registry
    .registerCapability(
      completeRegistration({
        name: 'a-new-capability',
        connector: 'erp-http',
        input_schema: '{"properties":{}}',
        concept: 'a-concept',
      }),
    )
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConnectorPlaceholderOutsideInputSchemaError);
  expect(refusal).not.toBeInstanceOf(ConceptAlreadyAnsweredError);
});

it("treats a registration whose own input_schema declares no properties key at all as declaring nothing, so every placeholder the connector's registered configuration embeds is orphaned", async () => {
  const configuration = registeredConfiguration({ configuration: '{"address":"${subject:customer_document}"}' });
  const reader: IConnectorConfigurationsReader = { readConnectorConfigurations: async () => [configuration] };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), reader);

  const refusal = await registry
    .registerCapability(completeRegistration({ connector: 'erp-http', input_schema: '{}' }))
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConnectorPlaceholderOutsideInputSchemaError);
  expect((refusal as ConnectorPlaceholderOutsideInputSchemaError).context.orphaned).toEqual([
    { placeholder: 'customer_document', capabilities: [{ connector: 'erp-http', input_schema: '{}' }] },
  ]);
});

it("succeeds without any orphaned-placeholder refusal when the connector's registered configuration embeds no placeholder at all", async () => {
  const configuration = registeredConfiguration({ configuration: '{"address":"https://api.example.test/records"}' });
  const reader: IConnectorConfigurationsReader = { readConnectorConfigurations: async () => [configuration] };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), reader);

  const registered = await registry.registerCapability(
    completeRegistration({ connector: 'erp-http', input_schema: '{"properties":{}}' }),
  );

  expect(registered.connector).toBe('erp-http');
});

it('propagates a failure the connector-configurations reader itself raises while checking for an orphaned placeholder during registerCapability, rather than swallowing it', async () => {
  const failingReader: IConnectorConfigurationsReader = {
    readConnectorConfigurations: async () => {
      throw new Error('the connector-configuration store is unavailable');
    },
  };
  const registry = new CapabilityRegistryService(new InMemoryCapabilityStore(), failingReader);

  const outcome = await registry.registerCapability(completeRegistration()).catch((error: unknown) => error);

  expect(outcome).toBeInstanceOf(Error);
  expect(outcome).not.toBeInstanceOf(ConnectorPlaceholderOutsideInputSchemaError);
  expect((outcome as Error).message).toBe('the connector-configuration store is unavailable');
});
