import { expect, it } from 'vitest';
import type {
  ICapabilitiesReader,
  RegisteredCapabilityForPlaceholderCheck,
} from '../../../connector-registry/capabilities-reader.port.js';
import {
  ConnectorConfigurationRegistryService,
  parsedConnectorConfiguration,
} from '../../../connector-registry/connector-configuration-registry.service.js';
import type { IConnectorConfigurationStore } from '../../../connector-registry/connector-configuration-store.port.js';
import type {
  ConnectorConfiguration,
  ConnectorConfigurationRegistration,
} from '../../../connector-registry/connector-configuration.js';
import { ConnectorConfigurationNotFoundError } from '../../../errors/connector-configuration-not-found.error.js';
import { ConnectorConfigurationNotWellFormedError } from '../../../errors/connector-configuration-not-well-formed.error.js';
import { ConnectorPlaceholderOutsideInputSchemaError } from '../../../errors/connector-placeholder-outside-input-schema.error.js';
import { IncompleteConnectorConfigurationError } from '../../../errors/incomplete-connector-configuration.error.js';

class InMemoryConnectorConfigurationStore implements IConnectorConfigurationStore {
  public constructor(private records: readonly ConnectorConfiguration[] = []) {}

  public async readConnectorConfigurations(): Promise<readonly ConnectorConfiguration[]> {
    return this.records;
  }

  public async writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void> {
    this.records = configurations;
  }

  public held(): readonly ConnectorConfiguration[] {
    return this.records;
  }
}

function heldConfiguration(overrides: Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {
  return {
    connector: 'a-connector',
    configuration: JSON.stringify({ whatever: 'the connector alone interprets this' }),
    ...overrides,
  };
}

function completeRegistration(overrides: ConnectorConfigurationRegistration = {}): ConnectorConfigurationRegistration {
  return { ...heldConfiguration(), ...overrides };
}

function namedProblems(refusal: unknown): string[] {
  if (!(refusal instanceof IncompleteConnectorConfigurationError)) {
    throw new Error('expected the incomplete-configuration refusal, got something else');
  }
  return refusal.context.problems.map((problem) => problem.split(' ')[0]);
}

it('refuses a registration that declares no connector identity', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const refusal = await registry
    .registerConnector(completeRegistration({ connector: undefined }))
    .catch((error: unknown) => error);

  expect(namedProblems(refusal)).toEqual(['connector']);
});

it('treats a connector identity declared as the empty string as undeclared', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const refusal = await registry
    .registerConnector(completeRegistration({ connector: '' }))
    .catch((error: unknown) => error);

  expect(namedProblems(refusal)).toEqual(['connector']);
});

it('refuses a registration whose configuration value is entirely undeclared, treating that as an incomplete registration', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const refusal = await registry
    .registerConnector(completeRegistration({ configuration: undefined }))
    .catch((error: unknown) => error);

  expect(namedProblems(refusal)).toEqual(['configuration']);
});

it('refuses an empty registration, naming both the connector and the configuration', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const refusal = await registry.registerConnector({}).catch((error: unknown) => error);

  expect(namedProblems(refusal).sort()).toEqual(['configuration', 'connector']);
});

it('writes nothing to the store when it refuses a registration', async () => {
  const alreadyHeld = heldConfiguration();
  const store = new InMemoryConnectorConfigurationStore([alreadyHeld]);
  const registry = new ConnectorConfigurationRegistryService(store);

  await registry.registerConnector(completeRegistration({ connector: undefined })).catch(() => undefined);

  expect(store.held()).toEqual([alreadyHeld]);
});

it('accepts a configuration payload of any shape, holding it unchanged rather than reading or validating a key inside it', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());
  const configuration = {
    nested: { deeply: ['whatever', 'this', 'connector', 'needs'] },
    notAMethodOrAnAddressOrAResponseMapping: true,
  };

  const registered = await registry.registerConnector(completeRegistration({ configuration }));

  expect(JSON.parse(registered.configuration)).toEqual(configuration);
});

it('persists an accepted registration through the store', async () => {
  const store = new InMemoryConnectorConfigurationStore();
  const registry = new ConnectorConfigurationRegistryService(store);

  const registered = await registry.registerConnector(completeRegistration());

  expect(store.held()).toEqual([registered]);
});

it('replaces the held configuration when a connector re-registers, rather than holding a second row', async () => {
  const store = new InMemoryConnectorConfigurationStore([
    heldConfiguration({ configuration: JSON.stringify({ version: 'old' }) }),
  ]);
  const registry = new ConnectorConfigurationRegistryService(store);

  await registry.registerConnector(completeRegistration({ configuration: { version: 'new' } }));

  expect(store.held()).toEqual([heldConfiguration({ configuration: JSON.stringify({ version: 'new' }) })]);
});

it("keeps every other connector's configuration untouched when one connector registers", async () => {
  const unrelated = heldConfiguration({ connector: 'an-unrelated-connector' });
  const store = new InMemoryConnectorConfigurationStore([unrelated]);
  const registry = new ConnectorConfigurationRegistryService(store);

  const registered = await registry.registerConnector(completeRegistration({ connector: 'a-new-connector' }));

  expect(store.held()).toEqual([unrelated, registered]);
});

it('resolves a registered connector to its currently held configuration', async () => {
  const held = heldConfiguration({ connector: 'a-registered-connector' });
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore([held]));

  const resolution = await registry.readConnectorConfiguration('a-registered-connector');

  expect(resolution).toEqual({ held: true, configuration: held });
});

it('resolves the absence of a connector nothing has registered, as data rather than a raised error', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const resolution = await registry.readConnectorConfiguration('an-unregistered-connector');

  expect(resolution).toEqual({ held: false, connector: 'an-unregistered-connector' });
});

it('resolves the connector configuration registered after an earlier resolution already answered its absence', async () => {
  const store = new InMemoryConnectorConfigurationStore();
  const registry = new ConnectorConfigurationRegistryService(store);
  await registry.readConnectorConfiguration('a-connector');

  const registered = await registry.registerConnector(completeRegistration({ connector: 'a-connector' }));
  const resolution = await registry.readConnectorConfiguration('a-connector');

  expect(resolution).toEqual({ held: true, configuration: registered });
});

it('refuses a registration whose configuration text is not syntactically valid JSON, naming the reason', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const refusal = await registry
    .registerConnector(completeRegistration({ configuration: '{not valid' }))
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConnectorConfigurationNotWellFormedError);
  expect(refusal).toMatchObject({ context: { reason: 'configuration is not syntactically valid JSON' } });
});

it('refuses a registration whose configuration text is valid JSON but a JSON array, naming the reason', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const refusal = await registry
    .registerConnector(completeRegistration({ configuration: '[1,2,3]' }))
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConnectorConfigurationNotWellFormedError);
  expect(refusal).toMatchObject({ context: { reason: 'configuration does not parse to a JSON object' } });
});

it('refuses a registration whose configuration text is valid JSON but a string primitive, naming the reason', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const refusal = await registry
    .registerConnector(completeRegistration({ configuration: '"a-string"' }))
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConnectorConfigurationNotWellFormedError);
  expect(refusal).toMatchObject({ context: { reason: 'configuration does not parse to a JSON object' } });
});

it('refuses a registration whose configuration text is valid JSON but the null primitive, naming the reason', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const refusal = await registry
    .registerConnector(completeRegistration({ configuration: 'null' }))
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConnectorConfigurationNotWellFormedError);
  expect(refusal).toMatchObject({ context: { reason: 'configuration does not parse to a JSON object' } });
});

it('writes nothing to the store when it refuses a registration for configuration text that is not syntactically valid JSON', async () => {
  const alreadyHeld = heldConfiguration();
  const store = new InMemoryConnectorConfigurationStore([alreadyHeld]);
  const registry = new ConnectorConfigurationRegistryService(store);

  await registry.registerConnector(completeRegistration({ configuration: '{not valid' })).catch(() => undefined);

  expect(store.held()).toEqual([alreadyHeld]);
});

it('writes nothing to the store when it refuses a registration for configuration text that parses to something other than a JSON object', async () => {
  const alreadyHeld = heldConfiguration();
  const store = new InMemoryConnectorConfigurationStore([alreadyHeld]);
  const registry = new ConnectorConfigurationRegistryService(store);

  await registry.registerConnector(completeRegistration({ configuration: '[1,2,3]' })).catch(() => undefined);

  expect(store.held()).toEqual([alreadyHeld]);
});

it('accepts a registration whose configuration text is valid JSON object text, holding the parsed object unchanged', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const registered = await registry.registerConnector(
    completeRegistration({ configuration: '{"whatever":"the connector alone interprets this"}' }),
  );

  expect(JSON.parse(registered.configuration)).toEqual({ whatever: 'the connector alone interprets this' });
});

it('refuses a registration whose configuration value is null as ConnectorConfigurationNotWellFormedError, naming the reason, rather than as an incomplete configuration', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const refusal = await registry
    .registerConnector(completeRegistration({ configuration: null }))
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConnectorConfigurationNotWellFormedError);
  expect(refusal).not.toBeInstanceOf(IncompleteConnectorConfigurationError);
  expect(refusal).toMatchObject({ context: { reason: 'configuration is not a JSON object' } });
});

it('refuses a registration whose configuration value is an array as ConnectorConfigurationNotWellFormedError, naming the reason, rather than as an incomplete configuration', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const refusal = await registry
    .registerConnector(completeRegistration({ configuration: ['not', 'an', 'object'] }))
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConnectorConfigurationNotWellFormedError);
  expect(refusal).not.toBeInstanceOf(IncompleteConnectorConfigurationError);
  expect(refusal).toMatchObject({ context: { reason: 'configuration is not a JSON object' } });
});

it('writes nothing to the store when it refuses a registration whose configuration value is null or an array', async () => {
  const alreadyHeld = heldConfiguration();
  const store = new InMemoryConnectorConfigurationStore([alreadyHeld]);
  const registry = new ConnectorConfigurationRegistryService(store);

  await registry.registerConnector(completeRegistration({ configuration: null })).catch(() => undefined);
  await registry
    .registerConnector(completeRegistration({ configuration: ['not', 'an', 'object'] }))
    .catch(() => undefined);

  expect(store.held()).toEqual([alreadyHeld]);
});

it('accepts a configuration value supplied already as a plain object, holding it as exactly the same text a JSON-text registration of the same content would resolve to', async () => {
  const store = new InMemoryConnectorConfigurationStore();
  const registry = new ConnectorConfigurationRegistryService(store);
  const content = { host: 'example.com', retries: 3 };

  const fromObject = await registry.registerConnector(
    completeRegistration({ connector: 'from-object', configuration: content }),
  );
  const fromText = await registry.registerConnector(
    completeRegistration({ connector: 'from-text', configuration: JSON.stringify(content) }),
  );

  expect(fromObject.configuration).toBe(fromText.configuration);
});

it('answers the held configuration directly, with no resolution wrapper, when one is currently registered under the named connector', async () => {
  const held = heldConfiguration({ connector: 'a-registered-connector' });
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore([held]));

  const resolved = await registry.readConnectorConfigurationOrThrow('a-registered-connector');

  expect(resolved).toEqual(held);
});

it('throws ConnectorConfigurationNotFoundError naming the requested connector, with the message unchanged from before the relocation, when nothing is registered under that name', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const refusal = await registry
    .readConnectorConfigurationOrThrow('an-unregistered-connector')
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConnectorConfigurationNotFoundError);
  expect(refusal).toMatchObject({ context: { connector: 'an-unregistered-connector' } });
  expect((refusal as Error).message).toBe(
    'no connector configuration is currently registered for connector "an-unregistered-connector"',
  );
});

it('propagates a failure the underlying store read itself raises, rather than reporting it as ConnectorConfigurationNotFoundError', async () => {
  const failingStore: IConnectorConfigurationStore = {
    readConnectorConfigurations: async () => {
      throw new Error('the store is unavailable');
    },
    writeConnectorConfigurations: async () => undefined,
  };
  const registry = new ConnectorConfigurationRegistryService(failingStore);

  const outcome = await registry
    .readConnectorConfigurationOrThrow('a-connector')
    .catch((error: unknown) => error);

  expect(outcome).toBeInstanceOf(Error);
  expect(outcome).not.toBeInstanceOf(ConnectorConfigurationNotFoundError);
  expect((outcome as Error).message).toBe('the store is unavailable');
});

it('answers configuration as a JSON text string, never a parsed object, through readConnectorConfigurationOrThrow after a registration supplied it as a parsed object', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());
  const suppliedObject = { host: 'example.com', retries: 3 };
  await registry.registerConnector(completeRegistration({ connector: 'a-connector', configuration: suppliedObject }));

  const resolved = await registry.readConnectorConfigurationOrThrow('a-connector');

  expect(typeof resolved.configuration).toBe('string');
});

it('answers a configuration through readConnectorConfigurationOrThrow that parses back to exactly the object the connector was registered with', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());
  const suppliedObject = { host: 'example.com', retries: 3, nested: { timeout: null }, tags: ['a', 'b'] };
  await registry.registerConnector(completeRegistration({ connector: 'a-connector', configuration: suppliedObject }));

  const resolved = await registry.readConnectorConfigurationOrThrow('a-connector');

  expect(JSON.parse(resolved.configuration)).toEqual(suppliedObject);
});

it("answers every entry's configuration as a JSON text string, never a parsed object, through listConnectorConfigurations after registrations each supplied as a parsed object", async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());
  await registry.registerConnector(
    completeRegistration({ connector: 'connector-a', configuration: { endpoint: 'https://a.example.test' } }),
  );
  await registry.registerConnector(
    completeRegistration({ connector: 'connector-b', configuration: { endpoint: 'https://b.example.test', retries: 2 } }),
  );

  const page = await registry.listConnectorConfigurations({ offset: 0, limit: 10 });

  expect(page.data).toHaveLength(2);
  expect(page.data.every((entry) => typeof entry.configuration === 'string')).toBe(true);
});

it("answers each entry through listConnectorConfigurations parsing back to exactly the object its own connector was registered with", async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());
  const registeredA = { endpoint: 'https://a.example.test', tags: ['x', 'y'] };
  const registeredB = { endpoint: 'https://b.example.test', retries: 2, active: false };
  await registry.registerConnector(completeRegistration({ connector: 'connector-a', configuration: registeredA }));
  await registry.registerConnector(completeRegistration({ connector: 'connector-b', configuration: registeredB }));

  const page = await registry.listConnectorConfigurations({ offset: 0, limit: 10 });

  const byConnector = new Map(page.data.map((entry) => [entry.connector, entry.configuration]));
  expect(JSON.parse(byConnector.get('connector-a') as string)).toEqual(registeredA);
  expect(JSON.parse(byConnector.get('connector-b') as string)).toEqual(registeredB);
});

it('round-trips an empty object supplied as configuration to the empty-object JSON text "{}" through readConnectorConfigurationOrThrow, the smallest well-formed JSON object this criterion applies to', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());
  await registry.registerConnector(completeRegistration({ connector: 'a-connector', configuration: {} }));

  const resolved = await registry.readConnectorConfigurationOrThrow('a-connector');

  expect(resolved.configuration).toBe('{}');
});

it('holds a string-supplied configuration exactly as given, not re-parsed and re-serialized, so its own non-canonical formatting survives a read back through readConnectorConfigurationOrThrow', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const suppliedText = '{ "b": 2, "a": 1 }';
  await registry.registerConnector(completeRegistration({ connector: 'a-connector', configuration: suppliedText }));

  const resolved = await registry.readConnectorConfigurationOrThrow('a-connector');

  expect(resolved.configuration).toBe(suppliedText);
});

it('parsedConnectorConfiguration parses a well-formed held configuration back into exactly the object its own text holds', () => {
  const held: ConnectorConfiguration = { connector: 'a-connector', configuration: JSON.stringify({ host: 'example.com' }) };

  expect(parsedConnectorConfiguration(held)).toEqual({ host: 'example.com' });
});

it('parsedConnectorConfiguration throws ConnectorConfigurationNotWellFormedError, naming the same reason the write side raises, for a held configuration whose text does not parse to a plain object', () => {
  const corrupted: ConnectorConfiguration = { connector: 'a-connector', configuration: '[1,2,3]' };

  let refusal: unknown;
  try {
    parsedConnectorConfiguration(corrupted);
  } catch (error) {
    refusal = error;
  }

  expect(refusal).toBeInstanceOf(ConnectorConfigurationNotWellFormedError);
  expect(refusal).toMatchObject({ context: { reason: 'configuration does not parse to a JSON object' } });
});

it('answers every capability the injected reader currently holds, exactly as that reader answers it', async () => {
  const registeredCapabilities = [
    { connector: 'a-connector', input_schema: '{"properties":{"id":{}}}' },
    { connector: 'another-connector', input_schema: '{"properties":{}}' },
  ];
  const reader: ICapabilitiesReader = {
    readCapabilities: async () => registeredCapabilities,
  };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), reader);

  const answered = await registry.readRegisteredCapabilities();

  expect(answered).toEqual(registeredCapabilities);
});

it('answers the empty array from readRegisteredCapabilities when constructed with no capabilities reader at all', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const answered = await registry.readRegisteredCapabilities();

  expect(answered).toEqual([]);
});

it('propagates a failure the injected capabilities reader itself raises, rather than swallowing it', async () => {
  const failingReader: ICapabilitiesReader = {
    readCapabilities: async () => {
      throw new Error('the capability store is unavailable');
    },
  };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), failingReader);

  const outcome = await registry.readRegisteredCapabilities().catch((error: unknown) => error);

  expect(outcome).toBeInstanceOf(Error);
  expect((outcome as Error).message).toBe('the capability store is unavailable');
});

function registeredCapability(
  overrides: Partial<RegisteredCapabilityForPlaceholderCheck> = {},
): RegisteredCapabilityForPlaceholderCheck {
  return {
    connector: 'erp-http',
    input_schema: JSON.stringify({ properties: {} }),
    ...overrides,
  };
}

it('refuses a registration whose call text embeds a Subject-attribute placeholder no capability currently registered against that connector declares, as ConnectorPlaceholderOutsideInputSchemaError', async () => {
  const capability = registeredCapability({ input_schema: JSON.stringify({ properties: { contract_number: {} } }) });
  const reader: ICapabilitiesReader = { readCapabilities: async () => [capability] };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), reader);

  const refusal = await registry
    .registerConnector(
      completeRegistration({
        connector: 'erp-http',
        configuration: '{"address":"https://api.example.test/records/${subject:customer_document}"}',
      }),
    )
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConnectorPlaceholderOutsideInputSchemaError);
});

it('writes nothing to the store when it refuses a registration for an orphaned placeholder', async () => {
  const capability = registeredCapability({ input_schema: JSON.stringify({ properties: { contract_number: {} } }) });
  const reader: ICapabilitiesReader = { readCapabilities: async () => [capability] };
  const alreadyHeld = heldConfiguration({ connector: 'an-unrelated-connector' });
  const store = new InMemoryConnectorConfigurationStore([alreadyHeld]);
  const registry = new ConnectorConfigurationRegistryService(store, reader);

  await registry
    .registerConnector(
      completeRegistration({
        connector: 'erp-http',
        configuration: '{"address":"${subject:customer_document}"}',
      }),
    )
    .catch(() => undefined);

  expect(store.held()).toEqual([alreadyHeld]);
});

it('names the orphaned placeholder together with the capability that fails to declare it', async () => {
  const capability = registeredCapability({ input_schema: JSON.stringify({ properties: { contract_number: {} } }) });
  const reader: ICapabilitiesReader = { readCapabilities: async () => [capability] };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), reader);

  const refusal = await registry
    .registerConnector(
      completeRegistration({
        connector: 'erp-http',
        configuration: '{"address":"https://api.example.test/records/${subject:customer_document}"}',
      }),
    )
    .catch((error: unknown) => error);

  expect((refusal as ConnectorPlaceholderOutsideInputSchemaError).context.orphaned).toEqual([
    { placeholder: 'customer_document', capabilities: [capability] },
  ]);
});

it('names both orphaned placeholders together when the call text embeds two the capability does not declare', async () => {
  const capability = registeredCapability({ input_schema: JSON.stringify({ properties: { contract_number: {} } }) });
  const reader: ICapabilitiesReader = { readCapabilities: async () => [capability] };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), reader);

  const refusal = await registry
    .registerConnector(
      completeRegistration({
        connector: 'erp-http',
        configuration: '{"a":"${subject:customer_document}","b":"${subject:policy_number}"}',
      }),
    )
    .catch((error: unknown) => error);

  const orphaned = [...(refusal as ConnectorPlaceholderOutsideInputSchemaError).context.orphaned].sort((a, b) =>
    a.placeholder.localeCompare(b.placeholder),
  );
  expect(orphaned).toEqual([
    { placeholder: 'customer_document', capabilities: [capability] },
    { placeholder: 'policy_number', capabilities: [capability] },
  ]);
});

it('names every capability that fails to declare the placeholder, when more than one is registered against the connector and none declares it', async () => {
  const capabilityA = registeredCapability({ input_schema: JSON.stringify({ properties: { contract_number: {} } }) });
  const capabilityB = registeredCapability({ input_schema: JSON.stringify({ properties: { case_id: {} } }) });
  const reader: ICapabilitiesReader = { readCapabilities: async () => [capabilityA, capabilityB] };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), reader);

  const refusal = await registry
    .registerConnector(
      completeRegistration({ connector: 'erp-http', configuration: '{"address":"${subject:customer_document}"}' }),
    )
    .catch((error: unknown) => error);

  expect((refusal as ConnectorPlaceholderOutsideInputSchemaError).context.orphaned).toEqual([
    { placeholder: 'customer_document', capabilities: [capabilityA, capabilityB] },
  ]);
});

it('names one orphaned placeholder once, not once per occurrence, when the call text embeds it more than once', async () => {
  const capability = registeredCapability();
  const reader: ICapabilitiesReader = { readCapabilities: async () => [capability] };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), reader);

  const refusal = await registry
    .registerConnector(
      completeRegistration({
        connector: 'erp-http',
        configuration: '{"a":"${subject:customer_document}","b":"${subject:customer_document}"}',
      }),
    )
    .catch((error: unknown) => error);

  expect((refusal as ConnectorPlaceholderOutsideInputSchemaError).context.orphaned).toEqual([
    { placeholder: 'customer_document', capabilities: [capability] },
  ]);
});

it('names a failing capability by exactly the connector and input_schema attributes the reader answered, adding no wider identity of its own', async () => {
  const capability = registeredCapability({ input_schema: JSON.stringify({ properties: { contract_number: {} } }) });
  const reader: ICapabilitiesReader = { readCapabilities: async () => [capability] };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), reader);

  const refusal = await registry
    .registerConnector(
      completeRegistration({ connector: 'erp-http', configuration: '{"address":"${subject:customer_document}"}' }),
    )
    .catch((error: unknown) => error);

  const [entry] = (refusal as ConnectorPlaceholderOutsideInputSchemaError).context.orphaned;
  expect(Object.keys(entry.capabilities[0]).sort()).toEqual(['connector', 'input_schema']);
});

it('succeeds when at least one capability registered against the connector declares the placeholder attribute, even though another fails to', async () => {
  const declares = registeredCapability({ input_schema: JSON.stringify({ properties: { customer_document: {} } }) });
  const doesNotDeclare = registeredCapability();
  const reader: ICapabilitiesReader = { readCapabilities: async () => [doesNotDeclare, declares] };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), reader);

  const registered = await registry.registerConnector(
    completeRegistration({ connector: 'erp-http', configuration: '{"address":"${subject:customer_document}"}' }),
  );

  expect(JSON.parse(registered.configuration)).toEqual({ address: '${subject:customer_document}' });
});

it('never refuses a placeholder naming the requester or a credential, even though the registered capability declares no properties at all', async () => {
  const capability = registeredCapability();
  const reader: ICapabilitiesReader = { readCapabilities: async () => [capability] };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), reader);

  const registered = await registry.registerConnector(
    completeRegistration({
      connector: 'erp-http',
      configuration:
        '{"address":"https://api.example.test/as/${requester}","headers":{"Authorization":"Bearer ${credential:ACME_API_KEY}"}}',
    }),
  );

  expect(JSON.parse(registered.configuration)).toEqual({
    address: 'https://api.example.test/as/${requester}',
    headers: { Authorization: 'Bearer ${credential:ACME_API_KEY}' },
  });
});

it('holds an edit of an already-registered connector configuration to the same orphaned-placeholder refusal as a new registration, leaving the previously held configuration untouched', async () => {
  const capability = registeredCapability({ input_schema: JSON.stringify({ properties: { contract_number: {} } }) });
  const reader: ICapabilitiesReader = { readCapabilities: async () => [capability] };
  const alreadyHeld = heldConfiguration({
    connector: 'erp-http',
    configuration: JSON.stringify({ address: 'https://api.example.test/records' }),
  });
  const store = new InMemoryConnectorConfigurationStore([alreadyHeld]);
  const registry = new ConnectorConfigurationRegistryService(store, reader);

  const refusal = await registry
    .registerConnector(
      completeRegistration({
        connector: 'erp-http',
        configuration: '{"address":"https://api.example.test/records/${subject:customer_document}"}',
      }),
    )
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConnectorPlaceholderOutsideInputSchemaError);
  expect(store.held()).toEqual([alreadyHeld]);
});

it('succeeds regardless of an embedded orphaned-looking placeholder when no capability at all is currently registered', async () => {
  const reader: ICapabilitiesReader = { readCapabilities: async () => [] };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), reader);

  const registered = await registry.registerConnector(
    completeRegistration({ connector: 'erp-http', configuration: '{"address":"${subject:customer_document}"}' }),
  );

  expect(JSON.parse(registered.configuration)).toEqual({ address: '${subject:customer_document}' });
});

it('succeeds regardless of an embedded orphaned-looking placeholder when every currently registered capability names a different connector', async () => {
  const capability = registeredCapability({ connector: 'a-different-connector' });
  const reader: ICapabilitiesReader = { readCapabilities: async () => [capability] };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), reader);

  const registered = await registry.registerConnector(
    completeRegistration({ connector: 'erp-http', configuration: '{"address":"${subject:customer_document}"}' }),
  );

  expect(JSON.parse(registered.configuration)).toEqual({ address: '${subject:customer_document}' });
});

it('succeeds regardless of an embedded orphaned-looking placeholder when constructed with the default (no) capabilities reader', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());

  const registered = await registry.registerConnector(
    completeRegistration({ connector: 'erp-http', configuration: '{"address":"${subject:customer_document}"}' }),
  );

  expect(JSON.parse(registered.configuration)).toEqual({ address: '${subject:customer_document}' });
});

it('refuses configuration text that is not syntactically valid JSON as ConnectorConfigurationNotWellFormedError, even though the same text would also embed an orphaned placeholder', async () => {
  const capability = registeredCapability();
  const reader: ICapabilitiesReader = { readCapabilities: async () => [capability] };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), reader);

  const refusal = await registry
    .registerConnector(
      completeRegistration({ connector: 'erp-http', configuration: '{not valid ${subject:customer_document}' }),
    )
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConnectorConfigurationNotWellFormedError);
  expect(refusal).not.toBeInstanceOf(ConnectorPlaceholderOutsideInputSchemaError);
});

it('succeeds without any orphaned-placeholder refusal when the call text embeds no placeholder at all', async () => {
  const capability = registeredCapability();
  const reader: ICapabilitiesReader = { readCapabilities: async () => [capability] };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), reader);

  const registered = await registry.registerConnector(
    completeRegistration({ connector: 'erp-http', configuration: '{"address":"https://api.example.test/records"}' }),
  );

  expect(JSON.parse(registered.configuration)).toEqual({ address: 'https://api.example.test/records' });
});

it('propagates a failure the capabilities reader itself raises while checking for an orphaned placeholder, rather than swallowing it', async () => {
  const failingReader: ICapabilitiesReader = {
    readCapabilities: async () => {
      throw new Error('the capability store is unavailable');
    },
  };
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore(), failingReader);

  const outcome = await registry
    .registerConnector(
      completeRegistration({ connector: 'erp-http', configuration: { address: 'https://api.example.test' } }),
    )
    .catch((error: unknown) => error);

  expect(outcome).toBeInstanceOf(Error);
  expect(outcome).not.toBeInstanceOf(ConnectorPlaceholderOutsideInputSchemaError);
  expect((outcome as Error).message).toBe('the capability store is unavailable');
});
