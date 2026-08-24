// Proof for task/connector-configuration-authoring/list-connector-configurations-route:
// GET /v1/connectors exercised through Fastify's own app.inject() against a local
// instance registering createListConnectorConfigurationsRoutesPlugin() directly — the
// same shape list-capabilities.routes.spec.ts already establishes. The published
// connector-configuration-registry read is a stand-in here (TST-03 — a stand-in
// replaces a boundary, never business logic): listConnectorConfigurations is exactly
// the seam ListConnectorConfigurationsControllerDependencies declares, stood in for by
// a vi.fn(); the registry's own resolution behind that seam is proved separately in
// __tests__/unit/connector-registry. This file proves only that the route, controller
// and DTO carry that contract's promise onto the wire unchanged, that no authentication
// guard sits in front of it, and basic pagination resolution at the level
// list-capabilities.routes.spec.ts itself settled for.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { ConnectorConfiguration } from '../../../connector-registry/connector-configuration.js';
import type { ListConnectorConfigurationsControllerDependencies } from '../../../http/list-connector-configurations.controller.js';
import { createListConnectorConfigurationsRoutesPlugin } from '../../../http/list-connector-configurations.routes.js';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

type ListConnectorConfigurationsMock = ReturnType<
  typeof vi.fn<(pagination: PaginationRequest) => Promise<PaginatedResponse<ConnectorConfiguration>>>
>;

/** A connector configuration as the registry would already hold it, both declared attributes present, overridable per test. */
function heldConnectorConfiguration(overrides: Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {
  return {
    connector: 'a-connector',
    configuration: { endpoint: 'https://example.test' },
    ...overrides,
  };
}

/** A page of two connector configurations, every PaginatedResponse<ConnectorConfiguration> field present, overridable per test. */
function heldPage(overrides: Partial<PaginatedResponse<ConnectorConfiguration>> = {}): PaginatedResponse<ConnectorConfiguration> {
  return {
    data: [
      heldConnectorConfiguration({ connector: 'connector-a' }),
      heldConnectorConfiguration({ connector: 'connector-b' }),
    ],
    total: 2,
    limit: 20,
    offset: 0,
    pageCount: 1,
    ...overrides,
  };
}

/**
 * One Fastify instance registering exactly this route plugin — no authentication
 * guard, no error handler of its own, mirroring what list-capabilities.routes.spec.ts
 * builds for its own sibling route. defaultLimit and maxLimit default to two distinct,
 * deliberately non-coincidental figures so a test asserting one is never satisfied by
 * mistaking it for the other.
 */
function buildTestApp(bounds: { defaultLimit?: number; maxLimit?: number } = {}): {
  app: FastifyInstance;
  listConnectorConfigurations: ListConnectorConfigurationsMock;
} {
  const listConnectorConfigurations: ListConnectorConfigurationsMock = vi.fn();
  const dependencies: ListConnectorConfigurationsControllerDependencies = {
    listConnectorConfigurations,
    defaultLimit: bounds.defaultLimit ?? 20,
    maxLimit: bounds.maxLimit ?? 50,
  };
  const app = Fastify();
  app.register(createListConnectorConfigurationsRoutesPlugin(dependencies));
  return { app, listConnectorConfigurations };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1: every registered connector configuration, with its fields

it('answers 200 with every connector configuration the registry read resolved, each carrying its connector and configuration fields unchanged', async () => {
  const built = buildTestApp();
  app = built.app;
  const page = heldPage();
  built.listConnectorConfigurations.mockResolvedValueOnce(page);

  const response = await app.inject({ method: 'GET', url: '/v1/connectors' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(page);
});

it("answers a data array whose single entry carries exactly the connector and configuration fields the domain model declares, unchanged from what the connector-configuration read resolved", async () => {
  const built = buildTestApp();
  app = built.app;
  const configuration = heldConnectorConfiguration({ connector: 'a-known-connector', configuration: { apiKey: 'secret-value' } });
  built.listConnectorConfigurations.mockResolvedValueOnce(heldPage({ data: [configuration], total: 1, pageCount: 1 }));

  const response = await app.inject({ method: 'GET', url: '/v1/connectors' });

  const body = response.json() as PaginatedResponse<ConnectorConfiguration>;
  expect(body.data).toEqual([configuration]);
  expect(Object.keys(body.data[0] as object).sort()).toEqual(['configuration', 'connector']);
});

it('answers the paginated envelope with an empty data array and a total of zero, unchanged, when the registry holds no connector configuration at all', async () => {
  const built = buildTestApp();
  app = built.app;
  const emptyPage: PaginatedResponse<ConnectorConfiguration> = { data: [], total: 0, limit: 20, offset: 0, pageCount: 0 };
  built.listConnectorConfigurations.mockResolvedValueOnce(emptyPage);

  const response = await app.inject({ method: 'GET', url: '/v1/connectors' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(emptyPage);
});

// ------------------------------------------------------------------ criterion 2: no authentication credential required

it('answers 200 for a request carrying no authentication credential of any kind, rather than refusing it for lacking one', async () => {
  const built = buildTestApp();
  app = built.app;
  built.listConnectorConfigurations.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/connectors', headers: {} });

  expect(response.statusCode).toBe(200);
});

// ------------------------------------------------------------------ pagination behavior

it("passes the request's own offset and limit through to the connector-configuration read unchanged, when both are given and within bounds", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listConnectorConfigurations.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/connectors?offset=5&limit=10' });

  expect(built.listConnectorConfigurations).toHaveBeenCalledWith({ offset: 5, limit: 10 });
});

it('defaults offset to 0 when the request names none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.listConnectorConfigurations.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/connectors?limit=10' });

  expect(built.listConnectorConfigurations).toHaveBeenCalledWith({ offset: 0, limit: 10 });
});

it('resolves an absent limit against the configured defaultLimit rather than leaving it unbounded', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listConnectorConfigurations.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/connectors?offset=5' });

  expect(built.listConnectorConfigurations).toHaveBeenCalledWith({ offset: 5, limit: 20 });
});

it('clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listConnectorConfigurations.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/connectors?limit=500' });

  expect(response.statusCode).toBe(200);
  expect(built.listConnectorConfigurations).toHaveBeenCalledWith({ offset: 0, limit: 50 });
});

// ------------------------------------------------------------------ edge cases: malformed query

it('answers 400 for a non-numeric offset, without ever reaching the connector-configuration read', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/connectors?offset=not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.listConnectorConfigurations).not.toHaveBeenCalled();
});

it('answers 400 for a negative offset, one below the nonnegative range the schema declares, without ever reaching the connector-configuration read', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/connectors?offset=-1' });

  expect(response.statusCode).toBe(400);
  expect(built.listConnectorConfigurations).not.toHaveBeenCalled();
});

it('answers 400 for a limit of zero, one below the positive range the schema declares, without ever reaching the connector-configuration read', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/connectors?limit=0' });

  expect(response.statusCode).toBe(400);
  expect(built.listConnectorConfigurations).not.toHaveBeenCalled();
});
