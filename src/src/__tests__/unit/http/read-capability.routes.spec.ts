// Proof for task/capability-registry-http/read-capability-route: GET /v1/capabilities/{concept}
// exercised through Fastify's own app.inject() against a local instance registering
// createReadCapabilityRoutesPlugin() and error-handler.middleware.ts's own handleUnexpectedError
// directly — the same shape build-app.spec.ts exercises diagnose.routes.ts through, adapted
// because build-app.ts does not yet register this route (that wiring is
// task/case-lifecycle-http/register-routes-in-build-app, still outstanding at the time of this
// proof). The published capability-registry read is a stand-in here (TST-03 — a stand-in replaces
// a boundary, never business logic): ICapabilityQuery.readCapability is exactly the seam
// ReadCapabilityControllerDependencies declares, stood in for by a vi.fn(); the domain behavior
// behind that seam — one-capability-answers-one-concept, the registry's own resolution — is proved
// separately in __tests__/unit/capability-registry/capability-query.port.spec.ts.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { Capability } from '../../../capability-registry/capability.js';
import { readCapabilityResponseSchema } from '../../../http/dto/read-capability.dto.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReadCapabilityControllerDependencies } from '../../../http/read-capability.controller.js';
import { createReadCapabilityRoutesPlugin } from '../../../http/read-capability.routes.js';

type ReadCapabilityMock = ReturnType<typeof vi.fn<(concept: string) => Promise<CapabilityResolution>>>;

/** A capability as the registry would already hold it, for seeding the stand-in query — every one of the eight declared attributes, so criterion 1's "with its declared contract" has something whole to assert against. */
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

/** One Fastify instance registering exactly this route plugin plus the shared error handler — mirrors what build-app.ts wires for diagnose, ahead of the still-outstanding task that wires this route into build-app.ts itself. */
function buildTestApp(): { app: FastifyInstance; readCapability: ReadCapabilityMock } {
  const readCapability: ReadCapabilityMock = vi.fn();
  // listCapabilities is a minimal stub kept only to satisfy the widened
  // ICapabilityQuery interface (task/capability-registry-http/list-capabilities-query-extension):
  // this route under test never calls it.
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

// ------------------------------------------------------------------ criterion 1

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

// ------------------------------------------------------------------ criterion 2

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

// ------------------------------------------------------------------ edge cases

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
