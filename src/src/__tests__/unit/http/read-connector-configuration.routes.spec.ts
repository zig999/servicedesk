// Proof for task/connector-configuration-authoring/read-connector-configuration-route:
// GET /v1/connectors/{connector}, exercised through Fastify's own app.inject()
// against a local instance registering createReadConnectorConfigurationRoutesPlugin()
// and error-handler.middleware.ts's own handleUnexpectedError directly — the same
// shape read-capability.routes.spec.ts exercises its own sibling route through. The
// registry's own readConnectorConfiguration is a stand-in here (TST-03 — a stand-in
// replaces a boundary, never business logic): ConnectorConfigurationRegistryService's
// own read is exactly the seam ReadConnectorConfigurationControllerDependencies
// declares, stood in for by a vi.fn(); the domain resolution behind that seam is the
// already-delivered service's own concern, not this route's.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { ConnectorConfigurationResolution } from '../../../connector-registry/connector-configuration-registry.service.js';
import type { ConnectorConfiguration } from '../../../connector-registry/connector-configuration.js';
import { readConnectorConfigurationResponseSchema } from '../../../http/dto/read-connector-configuration.dto.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReadConnectorConfigurationControllerDependencies } from '../../../http/read-connector-configuration.controller.js';
import { createReadConnectorConfigurationRoutesPlugin } from '../../../http/read-connector-configuration.routes.js';

type ReadConnectorConfigurationMock = ReturnType<
  typeof vi.fn<(connector: string) => Promise<ConnectorConfigurationResolution>>
>;

/** A connector configuration exactly as the registry would already hold it, for seeding the stand-in read. */
function heldConnectorConfiguration(overrides: Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {
  return {
    connector: 'a-connector',
    configuration: { host: 'example.com', apiKey: 'a-secret' },
    ...overrides,
  };
}

/** One Fastify instance registering exactly this route plugin plus the shared error handler. */
function buildTestApp(): { app: FastifyInstance; readConnectorConfiguration: ReadConnectorConfigurationMock } {
  const readConnectorConfiguration: ReadConnectorConfigurationMock = vi.fn();
  const dependencies: ReadConnectorConfigurationControllerDependencies = { readConnectorConfiguration };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createReadConnectorConfigurationRoutesPlugin(dependencies));
  return { app, readConnectorConfiguration };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it('answers 200 with the connector and configuration fields exactly as currently held under the named connector', async () => {
  const built = buildTestApp();
  app = built.app;
  const configuration = heldConnectorConfiguration({
    connector: 'a-known-connector',
    configuration: { host: 'example.com', apiKey: 'a-secret' },
  });
  built.readConnectorConfiguration.mockResolvedValueOnce({ held: true, configuration });

  const response = await app.inject({ method: 'GET', url: '/v1/connectors/a-known-connector' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    connector: configuration.connector,
    configuration: JSON.stringify(configuration.configuration),
  });
  expect(Object.keys(response.json() as object).sort()).toEqual(
    Object.keys(readConnectorConfigurationResponseSchema.shape).sort(),
  );
});

// ------------------------------------------------------------------ registry-reads/connector-configuration-response-wire-type

it('returns configuration as a JSON string, never a parsed object', async () => {
  const built = buildTestApp();
  app = built.app;
  const configuration = heldConnectorConfiguration({
    connector: 'a-known-connector',
    configuration: { host: 'example.com', retries: 3, secure: true },
  });
  built.readConnectorConfiguration.mockResolvedValueOnce({ held: true, configuration });

  const response = await app.inject({ method: 'GET', url: '/v1/connectors/a-known-connector' });

  const body = response.json() as { configuration: unknown };
  expect(typeof body.configuration).toBe('string');
});

it('answers a configuration string that parses back to the same JSON value the connector was registered with', async () => {
  const built = buildTestApp();
  app = built.app;
  const registered = {
    host: 'example.com',
    retries: 3,
    secure: true,
    tags: ['a', 'b'],
    nested: { timeout: null },
    note: 'a "quoted" value with a backslash \\ in it',
  };
  const configuration = heldConnectorConfiguration({ connector: 'a-known-connector', configuration: registered });
  built.readConnectorConfiguration.mockResolvedValueOnce({ held: true, configuration });

  const response = await app.inject({ method: 'GET', url: '/v1/connectors/a-known-connector' });

  const body = response.json() as { configuration: string };
  expect(JSON.parse(body.configuration)).toEqual(registered);
});

it('answers a configuration string that parses back to an empty object when the connector was registered with no configuration keys at all', async () => {
  const built = buildTestApp();
  app = built.app;
  const configuration = heldConnectorConfiguration({ connector: 'a-known-connector', configuration: {} });
  built.readConnectorConfiguration.mockResolvedValueOnce({ held: true, configuration });

  const response = await app.inject({ method: 'GET', url: '/v1/connectors/a-known-connector' });

  const body = response.json() as { configuration: string };
  expect(JSON.parse(body.configuration)).toEqual({});
});

// ------------------------------------------------------------------ inference: configuration schema is z.string().min(1)

it('readConnectorConfigurationResponseSchema accepts the smallest string JSON.stringify() ever produces for an object, "{}"', () => {
  const result = readConnectorConfigurationResponseSchema.safeParse({ connector: 'a-connector', configuration: '{}' });

  expect(result.success).toBe(true);
});

it('readConnectorConfigurationResponseSchema rejects an empty string as configuration', () => {
  const result = readConnectorConfigurationResponseSchema.safeParse({ connector: 'a-connector', configuration: '' });

  expect(result.success).toBe(false);
});

// ------------------------------------------------------------------ criterion 2

it('does not refuse a request carrying no authentication credential', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readConnectorConfiguration.mockResolvedValueOnce({ held: true, configuration: heldConnectorConfiguration() });

  const response = await app.inject({ method: 'GET', url: '/v1/connectors/a-connector' });

  expect(response.statusCode).toBe(200);
});

// ------------------------------------------------------------------ not-found mapping

it('answers 404 with ConnectorConfigurationNotFoundError when no connector configuration is currently registered under the named connector', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readConnectorConfiguration.mockResolvedValueOnce({ held: false, connector: 'an-absent-connector' });

  const response = await app.inject({ method: 'GET', url: '/v1/connectors/an-absent-connector' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('ConnectorConfigurationNotFoundError');
  expect(body.error.details).toEqual({ connector: 'an-absent-connector' });
});

// ------------------------------------------------------------------ edge case

it('answers 400 via validation for a request with an empty connector segment, never reaching the read', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/connectors/' });

  expect(response.statusCode).toBe(400);
  expect(built.readConnectorConfiguration).not.toHaveBeenCalled();
});
