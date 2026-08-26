// Proof for task/connector-configuration-authoring/register-connector-route:
// PUT /v1/connectors/{connector} exercised through Fastify's own
// app.inject() against a local instance registering
// createRegisterConnectorRoutesPlugin() and error-handler.middleware.ts's
// own handleUnexpectedError directly — the same shape
// register-capability.routes.spec.ts already establishes, adapted for a
// route whose identity is carried in the path and whose body carries the
// configuration text alone. ConnectorConfigurationRegistryService['registerConnector']
// is the one stand-in here (TST-03 — a stand-in replaces a boundary, never
// business logic): the registry's own create-or-replace-by-connector-identity
// resolution and its existing undeclared-connector/non-plain-object refusals
// are proved separately in
// __tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts.
// This file proves only that the route, controller and DTO carry that
// contract's promise onto the wire unchanged: a valid request's path and
// body compose into one ConnectorConfigurationRegistration handed to
// registerConnector unmodified, a rejection with this task's own new
// ConnectorConfigurationNotWellFormedError (for either of its two reasons)
// resolves to the status the status-map table assigns, and no authentication
// guard stands in front of any of it.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type {
  ConnectorConfiguration,
  ConnectorConfigurationRegistration,
} from '../../../connector-registry/connector-configuration.js';
import { ConnectorConfigurationNotWellFormedError } from '../../../errors/connector-configuration-not-well-formed.error.js';
import { IncompleteConnectorConfigurationError } from '../../../errors/incomplete-connector-configuration.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { RegisterConnectorControllerDependencies } from '../../../http/register-connector.controller.js';
import { createRegisterConnectorRoutesPlugin } from '../../../http/register-connector.routes.js';

type RegisterConnectorMock = ReturnType<
  typeof vi.fn<(registration: ConnectorConfigurationRegistration) => Promise<ConnectorConfiguration>>
>;

/** Every attribute registerConnectorBodySchema requires, syntactically valid JSON object text so a test proving one thing never incidentally trips the well-formedness refusal it is not about. */
function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    configuration: '{"key":"value"}',
    ...overrides,
  };
}

/** A connector configuration as the registry would answer it, overridable per test. */
function heldConnectorConfiguration(overrides: Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {
  return {
    connector: 'a-connector',
    configuration: { key: 'value' },
    ...overrides,
  };
}

/** One Fastify instance registering exactly this route plugin plus the shared error handler — mirrors register-capability.routes.spec.ts's own buildTestApp. */
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

// ------------------------------------------------------------------ criterion 1 — creates a connector configuration at a name that does not yet exist

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

// ------------------------------------------------------------------ criteria 1 & 2 — no caching across requests
//
// The route holds no create-or-replace logic of its own — it answers 200
// with whatever registerConnector resolves, for both the create case and the
// replace case — the store-level fact that a second registration at a held
// connector identity replaces the held row whole rather than merging into it
// is ConnectorConfigurationRegistryService's own concern, unchanged by this
// task and already proved by connector-configuration-registry.service.spec.ts's
// own "persists an accepted registration through the store" and "replaces
// the held configuration when a connector re-registers, rather than holding
// a second row". What this route can and does prove on its own is that it
// never answers a previous or cached resolution: each request's own response
// and each call's own arguments come from that request alone.

it("answers each of two requests at the same :connector with that request's own resolution, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerConnector
    .mockResolvedValueOnce(heldConnectorConfiguration({ configuration: { key: 'first' } }))
    .mockResolvedValueOnce(heldConnectorConfiguration({ configuration: { key: 'second' } }));

  const first = await app.inject({ method: 'PUT', url: '/v1/connectors/a-connector', payload: validBody() });
  const second = await app.inject({
    method: 'PUT',
    url: '/v1/connectors/a-connector',
    payload: validBody({ configuration: '{"key":"second"}' }),
  });

  expect(first.statusCode).toBe(200);
  expect(second.statusCode).toBe(200);
  expect((first.json() as ConnectorConfiguration).configuration).toEqual({ key: 'first' });
  expect((second.json() as ConnectorConfiguration).configuration).toEqual({ key: 'second' });
  expect(built.registerConnector).toHaveBeenCalledTimes(2);
});

// ------------------------------------------------------------------ criterion 3 — configuration text that is not syntactically valid JSON

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

// ------------------------------------------------------------------ criterion 4 — configuration text that parses to something other than a JSON object

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

// ------------------------------------------------------------------ absent or empty connector name
// (task/connector-configuration-registration-conformance/incomplete-name-refusal-status, criteria 1-2)
//
// registerConnectorParamsSchema (z.string().min(1)) refuses an empty :connector path segment with
// 400 before the service is ever reached, so the registry's own absent/empty-connector refusal
// (IncompleteConnectorConfigurationError, connector-configuration-registry.service.ts's own
// isUndeclared check, proved at the service level by connector-configuration-registry.service.spec.ts's
// own "refuses a registration that declares no connector identity" and "treats a connector identity
// declared as the empty string as undeclared") cannot reach this route through the path segment
// today. registerConnector is the one boundary stand-in this route already uses (TST-03) to exercise
// every domain refusal it lets propagate, so it is exercised the same way here, mirroring the two
// ConnectorConfigurationNotWellFormedError tests immediately above.

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

// ------------------------------------------------------------------ criterion 5 — no authentication credential required

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

// ------------------------------------------------------------------ basic DTO validation

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
