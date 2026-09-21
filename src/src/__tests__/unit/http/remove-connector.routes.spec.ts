import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { RemoveConnectorControllerDependencies } from '../../../http/remove-connector.controller.js';
import { createRemoveConnectorRoutesPlugin } from '../../../http/remove-connector.routes.js';

type RemoveConnectorMock = ReturnType<typeof vi.fn<(connector: string) => Promise<void>>>;

function buildTestApp(): { app: FastifyInstance; removeConnector: RemoveConnectorMock } {
  const removeConnector: RemoveConnectorMock = vi.fn();
  const dependencies: RemoveConnectorControllerDependencies = { removeConnector };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createRemoveConnectorRoutesPlugin(dependencies));
  return { app, removeConnector };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('answers 204 with a wholly empty body, identically for a connector name currently registered and one nothing is registered under', async () => {
  const built = buildTestApp();
  app = built.app;
  built.removeConnector.mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined);

  const registeredResponse = await app.inject({ method: 'DELETE', url: '/v1/connectors/a-connector' });
  const unregisteredResponse = await app.inject({ method: 'DELETE', url: '/v1/connectors/an-absent-connector' });

  expect(registeredResponse.statusCode).toBe(204);
  expect(registeredResponse.body).toBe('');
  expect(registeredResponse.rawPayload.length).toBe(0);
  expect(unregisteredResponse.statusCode).toBe(204);
  expect(unregisteredResponse.body).toBe('');
  expect(unregisteredResponse.rawPayload.length).toBe(0);
  expect(built.removeConnector).toHaveBeenNthCalledWith(1, 'a-connector');
  expect(built.removeConnector).toHaveBeenNthCalledWith(2, 'an-absent-connector');
});

it(
  'answers 400 via validation for a request with an empty :connector segment, never 404 "route not found" — Fastify still ' +
    'matches the route with an empty string param for this segment, and removeConnectorParamsSchema (z.string().min(1)) is ' +
    'what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'DELETE', url: '/v1/connectors/' });

    expect(response.statusCode).toBe(400);
    const body = response.json() as { error: { code: string; message: string; details: unknown[] } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toContain('path');
    expect(body.error.details.length).toBeGreaterThan(0);
    expect(built.removeConnector).not.toHaveBeenCalled();
  },
);

it('answers the unchanged generic envelope, never a partial body or leaked detail, when removeConnector rejects with a generic, non-domain error', async () => {
  const built = buildTestApp();
  app = built.app;
  built.removeConnector.mockRejectedValueOnce(new Error('a generic failure'));

  const response = await app.inject({ method: 'DELETE', url: '/v1/connectors/a-connector' });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
  expect(response.body).not.toContain('a generic failure');
});
