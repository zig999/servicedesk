import { expect, expectTypeOf, it } from 'vitest';
import {
  ConnectorConfigurationRegistryService,
  type ConnectorConfigurationResolution,
} from '../../../connector-registry/connector-configuration-registry.service.js';
import type { IConnectorConfigurationStore } from '../../../connector-registry/connector-configuration-store.port.js';
import type { ConnectorConfiguration } from '../../../connector-registry/connector-configuration.js';
import {
  registeredMethodMismatch,
  type RegisteredConnectorConfigurationReader,
} from '../../../connector-registry/registered-method-comparison.js';
import { ConnectorConfigurationNotWellFormedError } from '../../../errors/connector-configuration-not-well-formed.error.js';

class InMemoryConnectorConfigurationStore implements IConnectorConfigurationStore {
  public constructor(private records: readonly ConnectorConfiguration[] = []) {}

  public async readConnectorConfigurations(): Promise<readonly ConnectorConfiguration[]> {
    return this.records;
  }

  public async writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void> {
    this.records = configurations;
  }
}

function readerAnswering(resolution: ConnectorConfigurationResolution): RegisteredConnectorConfigurationReader {
  return { readConnectorConfiguration: async () => resolution };
}

function registeredWithText(connector: string, configurationText: string): ConnectorConfigurationResolution {
  return { held: true, configuration: { connector, configuration: configurationText } };
}

it("names registered GET and operation POST when a configuration registered under the connector name declares GET and the operation declares POST", async () => {
  const registry = readerAnswering(registeredWithText('erp-http', JSON.stringify({ method: 'GET' })));

  const mismatch = await registeredMethodMismatch(registry, 'erp-http', 'POST');

  expect(mismatch).toEqual({ registered: 'GET', operation: 'POST' });
});

it("states no method_mismatch when the operation's own method is the lower-case path-item key get and the registered configuration declares GET", async () => {
  const registry = readerAnswering(registeredWithText('erp-http', JSON.stringify({ method: 'GET' })));

  const mismatch = await registeredMethodMismatch(registry, 'erp-http', 'get');

  expect(mismatch).toBeUndefined();
});

it("states no method_mismatch when the registered configuration's declared method upper-cased equals the operation's method upper-cased, whatever case either source gave it", async () => {
  const registry = readerAnswering(registeredWithText('erp-http', JSON.stringify({ method: 'put' })));

  const mismatch = await registeredMethodMismatch(registry, 'erp-http', 'PUT');

  expect(mismatch).toBeUndefined();
});

it('states no method_mismatch, whatever the operation method is, when no connector configuration is registered under the connector name', async () => {
  const registry = readerAnswering({ held: false, connector: 'erp-http' });

  const mismatch = await registeredMethodMismatch(registry, 'erp-http', 'POST');

  expect(mismatch).toBeUndefined();
});

it('states no method_mismatch, whatever the operation method is, when the configuration registered under the connector name declares no method in its own text', async () => {
  const registry = readerAnswering(registeredWithText('erp-http', JSON.stringify({ address: 'https://api.example.test' })));

  const mismatch = await registeredMethodMismatch(registry, 'erp-http', 'POST');

  expect(mismatch).toBeUndefined();
});

it("reports both its registered and operation values upper-cased even where the registered configuration's own text and the operation's own spelling were both lower-case", async () => {
  const registry = readerAnswering(registeredWithText('erp-http', JSON.stringify({ method: 'get' })));

  const mismatch = await registeredMethodMismatch(registry, 'erp-http', 'post');

  expect(mismatch).toEqual({ registered: 'GET', operation: 'POST' });
});

it('declares no capability parameter at all -- the registry, the connector name and the operation method are its whole signature', () => {
  expectTypeOf(registeredMethodMismatch).parameters.toEqualTypeOf<
    [RegisteredConnectorConfigurationReader, string, string]
  >();
});

it('declares its registry dependency as exactly one function shaped like ConnectorConfigurationRegistryService.readConnectorConfiguration, never a wider capability-carrying object', () => {
  expectTypeOf<RegisteredConnectorConfigurationReader>().toEqualTypeOf<{
    readonly readConnectorConfiguration: (connector: string) => Promise<ConnectorConfigurationResolution>;
  }>();
});

it('answers according to whatever the registry currently holds rather than a snapshot resolved before the connector was registered', async () => {
  let currentlyRegistered: ConnectorConfigurationResolution = { held: false, connector: 'erp-http' };
  const registry: RegisteredConnectorConfigurationReader = {
    readConnectorConfiguration: async () => currentlyRegistered,
  };

  const beforeRegistration = await registeredMethodMismatch(registry, 'erp-http', 'POST');
  currentlyRegistered = registeredWithText('erp-http', JSON.stringify({ method: 'GET' }));
  const afterRegistration = await registeredMethodMismatch(registry, 'erp-http', 'POST');

  expect(beforeRegistration).toBeUndefined();
  expect(afterRegistration).toEqual({ registered: 'GET', operation: 'POST' });
});

it('leaves the configuration registered under the connector name unchanged after computing the comparison', async () => {
  const store = new InMemoryConnectorConfigurationStore();
  const registry = new ConnectorConfigurationRegistryService(store);
  await registry.registerConnector({ connector: 'erp-http', configuration: JSON.stringify({ method: 'GET' }) });

  await registeredMethodMismatch(registry, 'erp-http', 'POST');

  const stillRegistered = await registry.readConnectorConfiguration('erp-http');
  expect(stillRegistered).toEqual({
    held: true,
    configuration: { connector: 'erp-http', configuration: JSON.stringify({ method: 'GET' }) },
  });
});

it('treats a method key present in the registered text but holding a non-string value the same as no method being declared', async () => {
  const registry = readerAnswering(registeredWithText('erp-http', JSON.stringify({ method: 123 })));

  const mismatch = await registeredMethodMismatch(registry, 'erp-http', 'POST');

  expect(mismatch).toBeUndefined();
});

it('propagates a failure the injected reader itself raises, rather than swallowing it', async () => {
  const failingReader: RegisteredConnectorConfigurationReader = {
    readConnectorConfiguration: async () => {
      throw new Error('the registry is unavailable');
    },
  };

  const outcome = await registeredMethodMismatch(failingReader, 'erp-http', 'POST').catch((error: unknown) => error);

  expect(outcome).toBeInstanceOf(Error);
  expect((outcome as Error).message).toBe('the registry is unavailable');
});

it("propagates ConnectorConfigurationNotWellFormedError when the currently registered configuration's own text does not parse to a JSON object, rather than treating it as declaring no method", async () => {
  const registry = readerAnswering(registeredWithText('erp-http', '[1,2,3]'));

  const outcome = await registeredMethodMismatch(registry, 'erp-http', 'POST').catch((error: unknown) => error);

  expect(outcome).toBeInstanceOf(ConnectorConfigurationNotWellFormedError);
});
