import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import { CapabilityCitedByEvidenceError } from '../../../errors/capability-cited-by-evidence.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { RemoveCapabilityControllerDependencies } from '../../../http/remove-capability.controller.js';
import { createRemoveCapabilityRoutesPlugin } from '../../../http/remove-capability.routes.js';

type RemoveCapabilityMock = ReturnType<typeof vi.fn<(name: string, version: string) => Promise<void>>>;

function buildTestApp(): { app: FastifyInstance; removeCapability: RemoveCapabilityMock } {
  const removeCapability: RemoveCapabilityMock = vi.fn();
  const dependencies: RemoveCapabilityControllerDependencies = { removeCapability };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createRemoveCapabilityRoutesPlugin(dependencies));
  return { app, removeCapability };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('answers 204 with a wholly empty body, identically for a capability identity currently registered and one nothing is registered under', async () => {
  const built = buildTestApp();
  app = built.app;
  built.removeCapability.mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined);

  const registeredResponse = await app.inject({ method: 'DELETE', url: '/v1/capabilities/a-capability/1.0.0' });
  const unregisteredResponse = await app.inject({ method: 'DELETE', url: '/v1/capabilities/an-absent-capability/9.9.9' });

  expect(registeredResponse.statusCode).toBe(204);
  expect(registeredResponse.body).toBe('');
  expect(registeredResponse.rawPayload.length).toBe(0);
  expect(unregisteredResponse.statusCode).toBe(204);
  expect(unregisteredResponse.body).toBe('');
  expect(unregisteredResponse.rawPayload.length).toBe(0);
  expect(built.removeCapability).toHaveBeenNthCalledWith(1, 'a-capability', '1.0.0');
  expect(built.removeCapability).toHaveBeenNthCalledWith(2, 'an-absent-capability', '9.9.9');
});

it(
  'answers 400 via validation for a request with an empty :version segment, never reaching removeCapability — Fastify still ' +
    'matches the route with an empty string param for this segment, and removeCapabilityParamsSchema (z.string().min(1)) is ' +
    'what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'DELETE', url: '/v1/capabilities/a-capability/' });

    expect(response.statusCode).toBe(400);
    const body = response.json() as { error: { code: string; message: string; details: unknown[] } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toContain('path');
    expect(body.error.details.length).toBeGreaterThan(0);
    expect(built.removeCapability).not.toHaveBeenCalled();
  },
);

it('answers HTTP 409 naming CapabilityCitedByEvidenceError and its (name, version) context as details, when removeCapability rejects with that class', async () => {
  const built = buildTestApp();
  app = built.app;
  built.removeCapability.mockRejectedValueOnce(new CapabilityCitedByEvidenceError('a-cited-capability', '1.0.0'));

  const response = await app.inject({ method: 'DELETE', url: '/v1/capabilities/a-cited-capability/1.0.0' });

  expect(response.statusCode).toBe(409);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CapabilityCitedByEvidenceError');
  expect(body.error.details).toEqual({ name: 'a-cited-capability', version: '1.0.0' });
});

it('answers the unchanged generic envelope, never a partial body or leaked detail, when removeCapability rejects with a generic, non-domain error', async () => {
  const built = buildTestApp();
  app = built.app;
  built.removeCapability.mockRejectedValueOnce(new Error('a generic failure'));

  const response = await app.inject({ method: 'DELETE', url: '/v1/capabilities/a-capability/1.0.0' });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
  expect(response.body).not.toContain('a generic failure');
});
