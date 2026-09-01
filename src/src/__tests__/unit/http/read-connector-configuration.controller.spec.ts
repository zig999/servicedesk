import { expect, it } from 'vitest';
import type { ConnectorConfiguration } from '../../../connector-registry/connector-configuration.js';
import { ConnectorConfigurationNotFoundError } from '../../../errors/connector-configuration-not-found.error.js';
import {
  handleReadConnectorConfigurationRequest,
  type ReadConnectorConfigurationControllerDependencies,
} from '../../../http/read-connector-configuration.controller.js';

function heldConfiguration(overrides: Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {
  return {
    connector: 'a-connector',
    configuration: JSON.stringify({ host: 'example.com' }),
    ...overrides,
  };
}

it('answers the wire projection of exactly the configuration its readConnectorConfiguration dependency resolves, performing no held-check of its own', async () => {
  const configuration = heldConfiguration({
    connector: 'a-known-connector',
    configuration: JSON.stringify({ host: 'example.com', retries: 3 }),
  });
  const dependencies: ReadConnectorConfigurationControllerDependencies = {
    readConnectorConfiguration: async () => configuration,
  };

  const result = await handleReadConnectorConfigurationRequest(dependencies, { connector: 'a-known-connector' });

  expect(result).toEqual({
    connector: configuration.connector,
    configuration: configuration.configuration,
  });
});

it('propagates exactly the ConnectorConfigurationNotFoundError its readConnectorConfiguration dependency rejects with, raising none of its own', async () => {
  const refusal = new ConnectorConfigurationNotFoundError('an-absent-connector');
  const dependencies: ReadConnectorConfigurationControllerDependencies = {
    readConnectorConfiguration: async () => {
      throw refusal;
    },
  };

  await expect(
    handleReadConnectorConfigurationRequest(dependencies, { connector: 'an-absent-connector' }),
  ).rejects.toBe(refusal);
});

it('calls its readConnectorConfiguration dependency with exactly the given connector, performing no held-check or transformation of the param itself', async () => {
  let received: string | undefined;
  const dependencies: ReadConnectorConfigurationControllerDependencies = {
    readConnectorConfiguration: async (connector) => {
      received = connector;
      return heldConfiguration({ connector });
    },
  };

  await handleReadConnectorConfigurationRequest(dependencies, { connector: 'Mixed-Case-Connector' });

  expect(received).toBe('Mixed-Case-Connector');
});

