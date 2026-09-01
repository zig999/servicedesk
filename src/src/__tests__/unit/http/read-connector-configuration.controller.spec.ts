import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
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

function proseOf(source: string): string {
  return source
    .split('\n')
    .map((line) => line.replace(/^\s*(\/\*\*|\*\/|\*|\/\/)\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

it("the transport-status comment cites rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused as the specification's own HTTP 404 decision, rather than claiming it undecided", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../http/read-connector-configuration.controller.ts', import.meta.url)), 'utf8');
  const prose = proseOf(source);

  expect(prose).not.toMatch(/undecided by the specification/i);
  expect(prose).toContain(
    "specification's own decision (rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused)",
  );
  expect(prose).toContain('is where that decision is enacted rather than chosen inline');
});
