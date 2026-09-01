import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { Capability } from '../../../capability-registry/capability.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ListCapabilitiesControllerDependencies } from '../../../http/list-capabilities.controller.js';
import { createListCapabilitiesRoutesPlugin } from '../../../http/list-capabilities.routes.js';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

type ListCapabilitiesMock = ReturnType<
  typeof vi.fn<(pagination: PaginationRequest) => Promise<PaginatedResponse<Capability>>>
>;

function heldCapability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: 'a-capability',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: 5_000,
    connector: 'a-connector',
    concept: 'a-concept',
    ...overrides,
  };
}

function heldPage(overrides: Partial<PaginatedResponse<Capability>> = {}): PaginatedResponse<Capability> {
  return {
    data: [heldCapability({ concept: 'concept-a', name: 'capability-a' }), heldCapability({ concept: 'concept-b', name: 'capability-b' })],
    total: 2,
    limit: 20,
    offset: 0,
    pageCount: 1,
    ...overrides,
  };
}

function buildTestApp(bounds: { defaultLimit?: number; maxLimit?: number } = {}): {
  app: FastifyInstance;
  listCapabilities: ListCapabilitiesMock;
} {
  const listCapabilities: ListCapabilitiesMock = vi.fn();

  const readCapability = vi.fn<(concept: string) => Promise<CapabilityResolution>>();
  const capabilityQuery: ICapabilityQuery = {
    readCapability,
    listCapabilities,
  };
  const dependencies: ListCapabilitiesControllerDependencies = {
    capabilityQuery,
    defaultLimit: bounds.defaultLimit ?? 20,
    maxLimit: bounds.maxLimit ?? 50,
  };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createListCapabilitiesRoutesPlugin(dependencies));
  return { app, listCapabilities };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it("answers 200 with the paginated page of every capability the capability query resolved, for a request naming its own offset and limit", async () => {
  const built = buildTestApp();
  app = built.app;
  const page = heldPage({ limit: 10, offset: 5 });
  built.listCapabilities.mockResolvedValueOnce(page);

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities?offset=5&limit=10' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(page);
});

it("passes the request's own offset and limit through to the capability query unchanged, when both are given and within bounds", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCapabilities.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/capabilities?offset=5&limit=10' });

  expect(built.listCapabilities).toHaveBeenCalledWith({ offset: 5, limit: 10 });
});

it("answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse declares — data, limit, offset, pageCount and total — nothing more and nothing less", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCapabilities.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities' });

  expect(Object.keys(response.json() as object).sort()).toEqual(['data', 'limit', 'offset', 'pageCount', 'total']);
});

it('answers a data array whose entries each carry every one of the capability contract\'s own eight attributes, unchanged from what the capability query resolved', async () => {
  const built = buildTestApp();
  app = built.app;
  const capability = heldCapability({ concept: 'a-known-concept' });
  built.listCapabilities.mockResolvedValueOnce(heldPage({ data: [capability], total: 1, pageCount: 1 }));

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities' });

  const body = response.json() as PaginatedResponse<Capability>;
  expect(body.data).toEqual([capability]);
  expect(Object.keys(body.data[0] as object).sort()).toEqual(Object.keys(capability).sort());
});

it('defaults offset to 0 when the request names none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCapabilities.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/capabilities?limit=10' });

  expect(built.listCapabilities).toHaveBeenCalledWith({ offset: 0, limit: 10 });
});

it('resolves an absent limit against the configured defaultLimit rather than leaving it unbounded', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listCapabilities.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/capabilities?offset=5' });

  expect(built.listCapabilities).toHaveBeenCalledWith({ offset: 5, limit: 20 });
});

it('clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listCapabilities.mockResolvedValueOnce(heldPage());

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities?limit=500' });

  expect(response.statusCode).toBe(200);
  expect(built.listCapabilities).toHaveBeenCalledWith({ offset: 0, limit: 50 });
});

it('passes a limit exactly equal to the configured maxLimit through unclamped', async () => {
  const built = buildTestApp({ defaultLimit: 20, maxLimit: 50 });
  app = built.app;
  built.listCapabilities.mockResolvedValueOnce(heldPage());

  await app.inject({ method: 'GET', url: '/v1/capabilities?limit=50' });

  expect(built.listCapabilities).toHaveBeenCalledWith({ offset: 0, limit: 50 });
});

it('answers the paginated envelope with an empty data array and a total of zero, unchanged, when the capability query resolves an empty registry', async () => {
  const built = buildTestApp();
  app = built.app;
  const emptyPage: PaginatedResponse<Capability> = { data: [], total: 0, limit: 20, offset: 0, pageCount: 0 };
  built.listCapabilities.mockResolvedValueOnce(emptyPage);

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(emptyPage);
});

it('answers 400 for a non-numeric offset, without ever reaching the capability query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities?offset=not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.listCapabilities).not.toHaveBeenCalled();
});

it('answers 400 for a non-numeric limit, without ever reaching the capability query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities?limit=not-a-number' });

  expect(response.statusCode).toBe(400);
  expect(built.listCapabilities).not.toHaveBeenCalled();
});

it('answers 400 for a negative offset, one below the nonnegative range the schema declares, without ever reaching the capability query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities?offset=-1' });

  expect(response.statusCode).toBe(400);
  expect(built.listCapabilities).not.toHaveBeenCalled();
});

it('answers 400 for a limit of zero, one below the positive range the schema declares, without ever reaching the capability query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities?limit=0' });

  expect(response.statusCode).toBe(400);
  expect(built.listCapabilities).not.toHaveBeenCalled();
});

it("answers 500 with the generic envelope, never the rejected call's own error text, when the capability query itself rejects", async () => {
  const built = buildTestApp();
  app = built.app;
  built.listCapabilities.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities' });

  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain('sensitive internal detail');
});
