import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type {
  ConnectorConfiguration,
  ConnectorConfigurationRegistration,
} from '../../../connector-registry/connector-configuration.js';
import { ConnectorConfigurationNotWellFormedError } from '../../../errors/connector-configuration-not-well-formed.error.js';
import { ConnectorPlaceholderOutsideInputSchemaError } from '../../../errors/connector-placeholder-outside-input-schema.error.js';
import { IncompleteConnectorConfigurationError } from '../../../errors/incomplete-connector-configuration.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { RegisterConnectorControllerDependencies } from '../../../http/register-connector.controller.js';
import { createRegisterConnectorRoutesPlugin } from '../../../http/register-connector.routes.js';

type RegisterConnectorMock = ReturnType<
  typeof vi.fn<(registration: ConnectorConfigurationRegistration) => Promise<ConnectorConfiguration>>
>;

function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    configuration: '{"key":"value"}',
    ...overrides,
  };
}

function heldConnectorConfiguration(overrides: Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {
  return {
    connector: 'a-connector',
    configuration: JSON.stringify({ key: 'value' }),
    ...overrides,
  };
}

function buildTestApp(): { app: FastifyInstance; registerConnector: RegisterConnectorMock } {
  const registerConnector: RegisterConnectorMock = vi.fn();
  const dependencies: RegisterConnectorControllerDependencies = { registerConnector };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createRegisterConnectorRoutesPlugin(dependencies));
  return { app, registerConnector };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('answers 200 with the held connector configuration registerConnector resolved, for a valid registration at the :connector the path names', async () => {
  const built = buildTestApp();
  app = built.app;
  const registered = heldConnectorConfiguration();
  built.registerConnector.mockResolvedValueOnce(registered);

  const response = await app.inject({ method: 'PUT', url: '/v1/connectors/a-connector', payload: validBody() });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(registered);
});

it('composes the path-carried connector identity and the body into one registration, calling registerConnector with it exactly', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConnector.mockResolvedValueOnce(heldConnectorConfiguration());

  await app.inject({ method: 'PUT', url: '/v1/connectors/a-connector', payload: validBody() });

  expect(built.registerConnector).toHaveBeenCalledWith({
    connector: 'a-connector',
    ...validBody(),
  });
});

it("answers each of two requests at the same :connector with that request's own resolution, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConnector
    .mockResolvedValueOnce(heldConnectorConfiguration({ configuration: JSON.stringify({ key: 'first' }) }))
    .mockResolvedValueOnce(heldConnectorConfiguration({ configuration: JSON.stringify({ key: 'second' }) }));

  const first = await app.inject({ method: 'PUT', url: '/v1/connectors/a-connector', payload: validBody() });
  const second = await app.inject({
    method: 'PUT',
    url: '/v1/connectors/a-connector',
    payload: validBody({ configuration: '{"key":"second"}' }),
  });

  expect(first.statusCode).toBe(200);
  expect(second.statusCode).toBe(200);
  expect(JSON.parse((first.json() as ConnectorConfiguration).configuration)).toEqual({ key: 'first' });
  expect(JSON.parse((second.json() as ConnectorConfiguration).configuration)).toEqual({ key: 'second' });
  expect(built.registerConnector).toHaveBeenCalledTimes(2);
});

it('refuses with the status the status map assigns ConnectorConfigurationNotWellFormedError when the configuration text is not syntactically valid JSON', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConnector.mockRejectedValueOnce(
    new ConnectorConfigurationNotWellFormedError('configuration is not syntactically valid JSON'),
  );

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/connectors/a-connector',
    payload: validBody({ configuration: '{not valid json' }),
  });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('ConnectorConfigurationNotWellFormedError');
  expect(body.error.details).toEqual({ reason: 'configuration is not syntactically valid JSON' });
});

it('refuses with the status the status map assigns ConnectorConfigurationNotWellFormedError when the configuration text parses to something other than a JSON object', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConnector.mockRejectedValueOnce(
    new ConnectorConfigurationNotWellFormedError('configuration does not parse to a JSON object'),
  );

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/connectors/a-connector',
    payload: validBody({ configuration: '[1,2,3]' }),
  });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('ConnectorConfigurationNotWellFormedError');
  expect(body.error.details).toEqual({ reason: 'configuration does not parse to a JSON object' });
});

it('refuses with the status the status map assigns ConnectorPlaceholderOutsideInputSchemaError, naming every orphaned placeholder together with the capability that fails to declare it', async () => {
  const built = buildTestApp();
  app = built.app;
  const failingCapability = { connector: 'erp-http', input_schema: JSON.stringify({ properties: { contract_number: {} } }) };
  built.registerConnector.mockRejectedValueOnce(
    new ConnectorPlaceholderOutsideInputSchemaError([
      { placeholder: 'customer_document', capabilities: [failingCapability] },
    ]),
  );

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/connectors/erp-http',
    payload: validBody({
      configuration: '{"address":"https://api.example.test/records/${subject:customer_document}"}',
    }),
  });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details?: { orphaned: unknown } } };
  expect(body.error.code).toBe('ConnectorPlaceholderOutsideInputSchemaError');
  expect(body.error.details).toEqual({
    orphaned: [{ placeholder: 'customer_document', capabilities: [failingCapability] }],
  });
});

it('refuses with the status the status map assigns IncompleteConnectorConfigurationError, reporting it by name, when registerConnector rejects with it', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConnector.mockRejectedValueOnce(
    new IncompleteConnectorConfigurationError(['connector is undeclared']),
  );

  const response = await app.inject({ method: 'PUT', url: '/v1/connectors/a-connector', payload: validBody() });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('IncompleteConnectorConfigurationError');
  expect(body.error.details).toEqual({ problems: ['connector is undeclared'] });
});

it('answers 200 for a request carrying no headers at all, reading no authentication or authorization header', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConnector.mockResolvedValueOnce(heldConnectorConfiguration());

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/connectors/a-connector',
    payload: validBody(),
    headers: {},
  });

  expect(response.statusCode).toBe(200);
});

it('answers 200 for a request carrying an authorization header naming no credential this route recognizes, dispatching it exactly as one that carries none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConnector.mockResolvedValueOnce(heldConnectorConfiguration());

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/connectors/a-connector',
    payload: validBody(),
    headers: { authorization: 'Bearer not-a-real-credential' },
  });

  expect(response.statusCode).toBe(200);
});

it('answers 400 for a wholly empty body, without ever reaching registerConnector', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'PUT', url: '/v1/connectors/a-connector', payload: {} });

  expect(response.statusCode).toBe(400);
  expect(built.registerConnector).not.toHaveBeenCalled();
});

it(
  'answers 400 via validation for a request with an empty :connector segment, never 404 "route not found" — Fastify still ' +
    'matches the route with an empty string param for this segment, and registerConnectorParamsSchema (z.string().min(1)) is ' +
    'what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'PUT', url: '/v1/connectors/', payload: validBody() });

    expect(response.statusCode).toBe(400);
    expect(built.registerConnector).not.toHaveBeenCalled();
  },
);
