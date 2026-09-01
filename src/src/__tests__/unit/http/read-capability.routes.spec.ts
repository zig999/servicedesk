import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { Capability } from '../../../capability-registry/capability.js';
import { readCapabilityResponseSchema } from '../../../http/dto/read-capability.dto.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReadCapabilityControllerDependencies } from '../../../http/read-capability.controller.js';
import { createReadCapabilityRoutesPlugin } from '../../../http/read-capability.routes.js';

type ReadCapabilityMock = ReturnType<typeof vi.fn<(concept: string) => Promise<CapabilityResolution>>>;

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

function buildTestApp(): { app: FastifyInstance; readCapability: ReadCapabilityMock } {
  const readCapability: ReadCapabilityMock = vi.fn();

  const capabilityQuery: ICapabilityQuery = {
    readCapability,
    listCapabilities: () => {
      throw new Error('listCapabilities is not scripted for this file');
    },
  };
  const dependencies: ReadCapabilityControllerDependencies = { capabilityQuery };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createReadCapabilityRoutesPlugin(dependencies));
  return { app, readCapability };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('answers 200 with the capability currently answering the named concept, carrying its whole declared contract', async () => {
  const built = buildTestApp();
  app = built.app;
  const capability = heldCapability({ concept: 'a-known-concept' });
  built.readCapability.mockResolvedValueOnce({ held: true, capability });

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities/a-known-concept' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(capability);
  expect(Object.keys(response.json() as object).sort()).toEqual(Object.keys(readCapabilityResponseSchema.shape).sort());
});

it('resolves the concept exactly as the path spelled it, case and hyphenation preserved, never normalized', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapability.mockResolvedValueOnce({ held: true, capability: heldCapability({ concept: 'Mixed-Case-Concept' }) });

  await app.inject({ method: 'GET', url: '/v1/capabilities/Mixed-Case-Concept' });

  expect(built.readCapability).toHaveBeenCalledWith('Mixed-Case-Concept');
});

it("answers each of two requests naming different concepts with that request's own resolution, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapability
    .mockResolvedValueOnce({ held: true, capability: heldCapability({ concept: 'concept-a', name: 'capability-a' }) })
    .mockResolvedValueOnce({ held: true, capability: heldCapability({ concept: 'concept-b', name: 'capability-b' }) });

  const first = await app.inject({ method: 'GET', url: '/v1/capabilities/concept-a' });
  const second = await app.inject({ method: 'GET', url: '/v1/capabilities/concept-b' });

  expect((first.json() as Capability).name).toBe('capability-a');
  expect((second.json() as Capability).name).toBe('capability-b');
});

it('refuses with the status the status map assigns ConceptNotAnsweredError, when no capability currently answers the named concept', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapability.mockResolvedValueOnce({ held: false, concept: 'an-absent-concept' });

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities/an-absent-concept' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('ConceptNotAnsweredError');
  expect(body.error.details).toEqual({ concept: 'an-absent-concept' });
});

it('answers 400 via validation for a request with an empty concept segment, never reaching the capability query', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities/' });

  expect(response.statusCode).toBe(400);
  expect(built.readCapability).not.toHaveBeenCalled();
});

it("answers 500 with a generic message, never the rejected call's own error text, when the capability query itself rejects", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapability.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities/a-concept' });

  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain('sensitive internal detail');
});
