import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { ConnectorConfiguration } from '../../../connector-registry/connector-configuration.js';
import { ConnectorConfigurationNotFoundError } from '../../../errors/connector-configuration-not-found.error.js';
import { readConnectorConfigurationResponseSchema } from '../../../http/dto/read-connector-configuration.dto.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReadConnectorConfigurationControllerDependencies } from '../../../http/read-connector-configuration.controller.js';
import { createReadConnectorConfigurationRoutesPlugin } from '../../../http/read-connector-configuration.routes.js';

type ReadConnectorConfigurationMock = ReturnType<
  typeof vi.fn<(connector: string) => Promise<ConnectorConfiguration>>
>;

function heldConnectorConfiguration(overrides: Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {
  return {
    connector: 'a-connector',
    configuration: JSON.stringify({ host: 'example.com', apiKey: 'a-secret' }),
    ...overrides,
  };
}

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

it('answers 200 with the connector and configuration fields exactly as currently held under the named connector', async () => {
  const built = buildTestApp();
  app = built.app;
  const configuration = heldConnectorConfiguration({
    connector: 'a-known-connector',
    configuration: JSON.stringify({ host: 'example.com', apiKey: 'a-secret' }),
  });
  built.readConnectorConfiguration.mockResolvedValueOnce(configuration);

  const response = await app.inject({ method: 'GET', url: '/v1/connectors/a-known-connector' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    connector: configuration.connector,
    configuration: configuration.configuration,
  });
  expect(Object.keys(response.json() as object).sort()).toEqual(
    Object.keys(readConnectorConfigurationResponseSchema.shape).sort(),
  );
});

it('returns configuration as a JSON string, never a parsed object', async () => {
  const built = buildTestApp();
  app = built.app;
  const configuration = heldConnectorConfiguration({
    connector: 'a-known-connector',
    configuration: JSON.stringify({ host: 'example.com', retries: 3, secure: true }),
  });
  built.readConnectorConfiguration.mockResolvedValueOnce(configuration);

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
  const configuration = heldConnectorConfiguration({
    connector: 'a-known-connector',
    configuration: JSON.stringify(registered),
  });
  built.readConnectorConfiguration.mockResolvedValueOnce(configuration);

  const response = await app.inject({ method: 'GET', url: '/v1/connectors/a-known-connector' });

  const body = response.json() as { configuration: string };
  expect(JSON.parse(body.configuration)).toEqual(registered);
});

it('answers a configuration string that parses back to an empty object when the connector was registered with no configuration keys at all', async () => {
  const built = buildTestApp();
  app = built.app;
  const configuration = heldConnectorConfiguration({
    connector: 'a-known-connector',
    configuration: JSON.stringify({}),
  });
  built.readConnectorConfiguration.mockResolvedValueOnce(configuration);

  const response = await app.inject({ method: 'GET', url: '/v1/connectors/a-known-connector' });

  const body = response.json() as { configuration: string };
  expect(JSON.parse(body.configuration)).toEqual({});
});

it('readConnectorConfigurationResponseSchema accepts the smallest string JSON.stringify() ever produces for an object, "{}"', () => {
  const result = readConnectorConfigurationResponseSchema.safeParse({ connector: 'a-connector', configuration: '{}' });

  expect(result.success).toBe(true);
});

it('readConnectorConfigurationResponseSchema rejects an empty string as configuration', () => {
  const result = readConnectorConfigurationResponseSchema.safeParse({ connector: 'a-connector', configuration: '' });

  expect(result.success).toBe(false);
});

it('does not refuse a request carrying no authentication credential', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readConnectorConfiguration.mockResolvedValueOnce(heldConnectorConfiguration());

  const response = await app.inject({ method: 'GET', url: '/v1/connectors/a-connector' });

  expect(response.statusCode).toBe(200);
});

it('answers 404 with ConnectorConfigurationNotFoundError when no connector configuration is currently registered under the named connector', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readConnectorConfiguration.mockRejectedValueOnce(new ConnectorConfigurationNotFoundError('an-absent-connector'));

  const response = await app.inject({ method: 'GET', url: '/v1/connectors/an-absent-connector' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('ConnectorConfigurationNotFoundError');
  expect(body.error.details).toEqual({ connector: 'an-absent-connector' });
});

it('answers 400 via validation for a request with an empty connector segment, never reaching the read', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/connectors/' });

  expect(response.statusCode).toBe(400);
  expect(built.readConnectorConfiguration).not.toHaveBeenCalled();
});
