// Proof for task/connector-registration/connector-configuration-persistence — the registry's own
// validate-before-write and replace-by-identity mechanics: a registration missing a connector
// identity or carrying a configuration that is not a plain object is refused before any write,
// re-registering under an already-held connector identity replaces that connector's row whole
// rather than merging or duplicating it, and the payload itself is held opaque — no key inside it
// is ever read or validated, whatever shape it takes. The store boundary is an in-memory stand-in
// (TST-03), so no test here touches a relational database.
import { expect, it } from 'vitest';
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
import { IncompleteConnectorConfigurationError } from '../../../errors/incomplete-connector-configuration.error.js';

/** Stands in for the store boundary, so the service is exercised without any relational database. */
class InMemoryConnectorConfigurationStore implements IConnectorConfigurationStore {
  public constructor(private records: readonly ConnectorConfiguration[] = []) {}

  public async readConnectorConfigurations(): Promise<readonly ConnectorConfiguration[]> {
    return this.records;
  }

  public async writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void> {
    this.records = configurations;
  }

  /** What the store now holds, for asserting what a registration persisted. */
  public held(): readonly ConnectorConfiguration[] {
    return this.records;
  }
}

/** A connector configuration as the registry would already hold it, for seeding the stand-in store. */
function heldConfiguration(overrides: Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {
  return {
    connector: 'a-connector',
    configuration: JSON.stringify({ whatever: 'the connector alone interprets this' }),
    ...overrides,
  };
}

/** A registration declaring the minimum shape this registry requires, for tests to depart from it one attribute at a time. */
function completeRegistration(overrides: ConnectorConfigurationRegistration = {}): ConnectorConfigurationRegistration {
  return { ...heldConfiguration(), ...overrides };
}

/** Which problems an incomplete-configuration refusal names, read from the refusal's own context. */
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

it('refuses a registration whose configuration is not a plain object, whether undeclared, null, or an array', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());
  const badConfigurations: unknown[] = [undefined, null, ['not', 'an', 'object']];

  const refusals = await Promise.all(
    badConfigurations.map((configuration) =>
      registry.registerConnector(completeRegistration({ configuration })).catch((error: unknown) => error),
    ),
  );

  expect(refusals.map(namedProblems)).toEqual([['configuration'], ['configuration'], ['configuration']]);
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
  await registry.readConnectorConfiguration('a-connector'); // answers the absence, baiting a memory

  const registered = await registry.registerConnector(completeRegistration({ connector: 'a-connector' }));
  const resolution = await registry.readConnectorConfiguration('a-connector');

  expect(resolution).toEqual({ held: true, configuration: registered });
});

// ------------------------------------------------------------------ configuration well-formedness
// Proof for task/connector-configuration-authoring/register-connector-route (criterion 3,
// rules/integration/a-connector-configuration-holds-a-well-formed-object): a configuration given
// as a string is this route's own wire representation of configuration text — parsed as JSON here,
// refused before any write where it fails JSON.parse or parses to something other than a plain
// object, not an array, not a primitive. This fixture file's own completeRegistration()/
// heldConfiguration() default configuration to a plain object already, so every test below
// overrides configuration explicitly with a string to exercise the well-formed/malformed
// distinction — mirroring capability-registry.service.spec.ts's own schema well-formedness block
// for the identical class of check.

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

// ------------------------------------------------------------------ read-connector-configuration's own service-level wrapper
// Proof for task/registry-read-not-found-relocation-and-rate-limit/connector-configuration-not-found-relocation:
// readConnectorConfigurationOrThrow's own two branches. readConnectorConfiguration itself keeps
// answering a miss as ordinary data, exactly as pinned above by "resolves the absence of a connector
// nothing has registered, as data rather than a raised error" (criterion 3, lines 158-164 of this
// file, left unmodified by this task) — so this block adds no assertion over that raw method, only
// over the new wrapper built on top of it.

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

// ------------------------------------------------------------------ task/connector-configuration-registration-conformance/configuration-held-as-text
// Proof for this task's own three criteria: a connector configuration read back after
// registration answers `configuration` as JSON object text — never a parsed object — from both
// read-connector-configuration's own service-level wrapper (readConnectorConfigurationOrThrow,
// exactly the dependency read-connector-configuration.controller.ts is wired to) and from
// listConnectorConfigurations, and a registration whose configuration was supplied as a parsed
// object round-trips to that same content as text on both of those reads. Every test below
// registers first, through registerConnector, and only then reads — through a second, separate
// call — so a fixture already pre-built as text (this file's own heldConfiguration() default)
// cannot stand in for the registry's own resolution of an object-supplied registration.

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

// ------------------------------------------------------------------ inference: a string-supplied configuration is held verbatim, never re-serialized

it('holds a string-supplied configuration exactly as given, not re-parsed and re-serialized, so its own non-canonical formatting survives a read back through readConnectorConfigurationOrThrow', async () => {
  const registry = new ConnectorConfigurationRegistryService(new InMemoryConnectorConfigurationStore());
  // Spacing and key order JSON.stringify(JSON.parse(...)) would not reproduce, so a re-serialization would fail this.
  const suppliedText = '{ "b": 2, "a": 1 }';
  await registry.registerConnector(completeRegistration({ connector: 'a-connector', configuration: suppliedText }));

  const resolved = await registry.readConnectorConfigurationOrThrow('a-connector');

  expect(resolved.configuration).toBe(suppliedText);
});

// ------------------------------------------------------------------ inference: parsedConnectorConfiguration's own defensive floor

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
