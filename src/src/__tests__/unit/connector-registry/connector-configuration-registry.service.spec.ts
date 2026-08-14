// Proof for task/connector-registration/connector-configuration-persistence — the registry's own
// validate-before-write and replace-by-identity mechanics: a registration missing a connector
// identity or carrying a configuration that is not a plain object is refused before any write,
// re-registering under an already-held connector identity replaces that connector's row whole
// rather than merging or duplicating it, and the payload itself is held opaque — no key inside it
// is ever read or validated, whatever shape it takes. The store boundary is an in-memory stand-in
// (TST-03), so no test here touches a relational database.
import { expect, it } from 'vitest';
import { ConnectorConfigurationRegistryService } from '../../../connector-registry/connector-configuration-registry.service.js';
import type { IConnectorConfigurationStore } from '../../../connector-registry/connector-configuration-store.port.js';
import type {
  ConnectorConfiguration,
  ConnectorConfigurationRegistration,
} from '../../../connector-registry/connector-configuration.js';
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
    configuration: { whatever: 'the connector alone interprets this' },
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

  expect(registered.configuration).toEqual(configuration);
});

it('persists an accepted registration through the store', async () => {
  const store = new InMemoryConnectorConfigurationStore();
  const registry = new ConnectorConfigurationRegistryService(store);

  const registered = await registry.registerConnector(completeRegistration());

  expect(store.held()).toEqual([registered]);
});

it('replaces the held configuration when a connector re-registers, rather than holding a second row', async () => {
  const store = new InMemoryConnectorConfigurationStore([heldConfiguration({ configuration: { version: 'old' } })]);
  const registry = new ConnectorConfigurationRegistryService(store);

  await registry.registerConnector(completeRegistration({ configuration: { version: 'new' } }));

  expect(store.held()).toEqual([heldConfiguration({ configuration: { version: 'new' } })]);
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
