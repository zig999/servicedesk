// Proof for task/registry-read-not-found-relocation-and-rate-limit/connector-configuration-not-found-relocation:
// handleReadConnectorConfigurationRequest itself, exercised directly as a plain function call rather
// than through Fastify — the one seam this task's own relocation touches. Proves the controller now
// performs no held-check-and-throw of its own (criterion 2): it projects onto the wire whatever its
// one injected readConnectorConfiguration dependency resolves, and propagates exactly whatever it
// rejects with, unaltered — never branching on a resolution shape of its own. The dependency itself
// is a stand-in (TST-03 — a stand-in replaces a boundary, never business logic): the real
// service-level wrapper it is wired to in production,
// ConnectorConfigurationRegistryService.readConnectorConfigurationOrThrow, is proved separately in
// connector-configuration-registry.service.spec.ts. Mirrors
// read-capability-by-identity.controller.spec.ts's own shape for the sibling relocation
// (task/registry-read-not-found-relocation-and-rate-limit/capability-not-found-relocation).
import { expect, it } from 'vitest';
import type { ConnectorConfiguration } from '../../../connector-registry/connector-configuration.js';
import { ConnectorConfigurationNotFoundError } from '../../../errors/connector-configuration-not-found.error.js';
import {
  handleReadConnectorConfigurationRequest,
  type ReadConnectorConfigurationControllerDependencies,
} from '../../../http/read-connector-configuration.controller.js';

/** A connector configuration exactly as the service-level wrapper's held branch would resolve it. */
function heldConfiguration(overrides: Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {
  return {
    connector: 'a-connector',
    configuration: { host: 'example.com' },
    ...overrides,
  };
}

// ------------------------------------------------------------------ criterion 2

it('answers the wire projection of exactly the configuration its readConnectorConfiguration dependency resolves, performing no held-check of its own', async () => {
  const configuration = heldConfiguration({
    connector: 'a-known-connector',
    configuration: { host: 'example.com', retries: 3 },
  });
  const dependencies: ReadConnectorConfigurationControllerDependencies = {
    readConnectorConfiguration: async () => configuration,
  };

  const result = await handleReadConnectorConfigurationRequest(dependencies, { connector: 'a-known-connector' });

  expect(result).toEqual({
    connector: configuration.connector,
    configuration: JSON.stringify(configuration.configuration),
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
