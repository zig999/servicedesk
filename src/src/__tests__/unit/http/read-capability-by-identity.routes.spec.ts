// Proof for task/registry-reads/read-capability-by-identity-route: GET
// /v1/capabilities/{name}/{version}, exercised through Fastify's own app.inject() against a
// local instance registering createReadCapabilityByIdentityRoutesPlugin() and
// error-handler.middleware.ts's own handleUnexpectedError directly — the same shape
// read-connector-configuration.routes.spec.ts exercises its own sibling route through.
// CapabilityRegistryService's own readCapabilityByIdentity is a stand-in here (TST-03 — a
// stand-in replaces a boundary, never business logic): the plain function seam
// ReadCapabilityByIdentityControllerDependencies declares is stood in for by a vi.fn(); the
// domain resolution behind that seam — CapabilityRegistryService.readCapabilityByIdentity
// itself — is that service's own concern, proved separately.
//
// The route's own wiring into build-app.ts's routePlugins() (criterion 3) is proved in
// build-app.spec.ts instead, where buildApp() itself, not this file's isolated plugin, is what
// answers.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { CapabilityIdentityResolution } from '../../../capability-registry/capability-registry.service.js';
import type { Capability } from '../../../capability-registry/capability.js';
import { CapabilityIdentityNotFoundError } from '../../../errors/capability-identity-not-found.error.js';
import { CapabilityNotRegisteredForTestError } from '../../../errors/capability-not-registered-for-test.error.js';
import { ConceptNotAnsweredError } from '../../../errors/concept-not-answered.error.js';
import { ConnectorConfigurationNotFoundError } from '../../../errors/connector-configuration-not-found.error.js';
import { readCapabilityByIdentityResponseSchema } from '../../../http/dto/read-capability-by-identity.dto.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReadCapabilityByIdentityControllerDependencies } from '../../../http/read-capability-by-identity.controller.js';
import { createReadCapabilityByIdentityRoutesPlugin } from '../../../http/read-capability-by-identity.routes.js';

type ReadCapabilityByIdentityMock = ReturnType<
  typeof vi.fn<(name: string, version: string) => Promise<CapabilityIdentityResolution>>
>;

/** A capability exactly as the registry would already hold it, every one of the eight declared attributes present, for seeding the stand-in read. */
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

/** One Fastify instance registering exactly this route plugin plus the shared error handler. */
function buildTestApp(): { app: FastifyInstance; readCapabilityByIdentity: ReadCapabilityByIdentityMock } {
  const readCapabilityByIdentity: ReadCapabilityByIdentityMock = vi.fn();
  const dependencies: ReadCapabilityByIdentityControllerDependencies = { readCapabilityByIdentity };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createReadCapabilityByIdentityRoutesPlugin(dependencies));
  return { app, readCapabilityByIdentity };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it('answers 200 with the capability currently registered under the named (name, version) identity, carrying its whole declared contract', async () => {
  const built = buildTestApp();
  app = built.app;
  const capability = heldCapability({ name: 'a-known-capability', version: '2.0.0' });
  built.readCapabilityByIdentity.mockResolvedValueOnce({ held: true, capability });

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities/a-known-capability/2.0.0' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(capability);
  expect(Object.keys(response.json() as object).sort()).toEqual(
    Object.keys(readCapabilityByIdentityResponseSchema.shape).sort(),
  );
});

it('resolves the identity exactly as the path spelled it, case and hyphenation preserved, never normalized', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({
    held: true,
    capability: heldCapability({ name: 'Mixed-Case-Capability', version: '1.0.0-RC.1' }),
  });

  await app.inject({ method: 'GET', url: '/v1/capabilities/Mixed-Case-Capability/1.0.0-RC.1' });

  expect(built.readCapabilityByIdentity).toHaveBeenCalledWith('Mixed-Case-Capability', '1.0.0-RC.1');
});

it("answers each of two requests naming different identities with that request's own resolution, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity
    .mockResolvedValueOnce({ held: true, capability: heldCapability({ name: 'capability-a', version: '1.0.0' }) })
    .mockResolvedValueOnce({ held: true, capability: heldCapability({ name: 'capability-b', version: '2.0.0' }) });

  const first = await app.inject({ method: 'GET', url: '/v1/capabilities/capability-a/1.0.0' });
  const second = await app.inject({ method: 'GET', url: '/v1/capabilities/capability-b/2.0.0' });

  expect((first.json() as Capability).name).toBe('capability-a');
  expect((second.json() as Capability).name).toBe('capability-b');
});

// ------------------------------------------------------------------ criterion 2

it('answers 404 with CapabilityIdentityNotFoundError and the requested identity as details, when no capability is currently registered under the named (name, version) identity', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({ held: false, name: 'an-absent-capability', version: '9.9.9' });

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities/an-absent-capability/9.9.9' });

  expect(response.statusCode).toBe(404);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CapabilityIdentityNotFoundError');
  expect(body.error.details).toEqual({ name: 'an-absent-capability', version: '9.9.9' });
});

it('raises a CapabilityIdentityNotFoundError instance that is none of ConceptNotAnsweredError, ConnectorConfigurationNotFoundError or CapabilityNotRegisteredForTestError, the three other read routes\' own not-found classes', () => {
  const error = new CapabilityIdentityNotFoundError('a-name', '1.0.0');

  expect(error).not.toBeInstanceOf(ConceptNotAnsweredError);
  expect(error).not.toBeInstanceOf(ConnectorConfigurationNotFoundError);
  expect(error).not.toBeInstanceOf(CapabilityNotRegisteredForTestError);
});

// ------------------------------------------------------------------ criterion 4

it('answers 200 for a request carrying no headers at all, reading no authentication or authorization header', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({ held: true, capability: heldCapability() });

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities/a-capability/1.0.0', headers: {} });

  expect(response.statusCode).toBe(200);
});

it('answers 200 for a request carrying an authorization header naming no credential this route recognizes, dispatching it exactly as one that carries none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockResolvedValueOnce({ held: true, capability: heldCapability() });

  const response = await app.inject({
    method: 'GET',
    url: '/v1/capabilities/a-capability/1.0.0',
    headers: { authorization: 'Bearer not-a-real-credential' },
  });

  expect(response.statusCode).toBe(200);
});

// ------------------------------------------------------------------ edge cases

it(
  'answers 400 via validation for a request with an empty :name segment, never reaching readCapabilityByIdentity — Fastify still ' +
    'matches the route with an empty string param for this segment, and readCapabilityByIdentityParamsSchema (z.string().min(1)) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'GET', url: '/v1/capabilities//1.0.0' });

    expect(response.statusCode).toBe(400);
    expect(built.readCapabilityByIdentity).not.toHaveBeenCalled();
  },
);

it(
  'answers 400 via validation for a request with an empty :version segment, never reaching readCapabilityByIdentity — Fastify still ' +
    'matches the route with an empty string param for this segment, and readCapabilityByIdentityParamsSchema (z.string().min(1)) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'GET', url: '/v1/capabilities/a-capability/' });

    expect(response.statusCode).toBe(400);
    expect(built.readCapabilityByIdentity).not.toHaveBeenCalled();
  },
);

it("answers 500 with a generic message, never the rejected call's own error text, when readCapabilityByIdentity itself rejects", async () => {
  const built = buildTestApp();
  app = built.app;
  built.readCapabilityByIdentity.mockRejectedValueOnce(
    new Error('a sensitive internal detail nobody outside the server should see'),
  );

  const response = await app.inject({ method: 'GET', url: '/v1/capabilities/a-capability/1.0.0' });

  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain('sensitive internal detail');
});
