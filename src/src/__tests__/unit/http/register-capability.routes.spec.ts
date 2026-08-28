// Proof for task/capability-authoring/register-capability-route: PUT
// /v1/capabilities/{name}/{version} exercised through Fastify's own
// app.inject() against a local instance registering
// createRegisterCapabilityRoutesPlugin() and error-handler.middleware.ts's
// own handleUnexpectedError directly — the same shape
// create-draft.routes.spec.ts and place-hypothesis.routes.spec.ts already
// establish, adapted for a route whose identity is carried in the path and
// whose body carries the rest of the registration.
// CapabilityRegistryService['registerCapability'] is the one stand-in here
// (TST-03 — a stand-in replaces a boundary, never business logic): the
// registry's own contract-completeness, read-only-nature,
// one-concept-one-capability and (this task's own new)
// schema-well-formedness refusals, and its create-or-replace-by-identity
// resolution, are proved separately in
// __tests__/unit/capability-registry/capability-registry.service.spec.ts
// and __tests__/unit/capability-registry/capability-query.port.spec.ts. This
// file proves only that the route, controller and DTO carry that contract's
// promise onto the wire unchanged: a valid request's path and body compose
// into one CapabilityRegistration handed to registerCapability unmodified,
// every one of the four domain refusals this task's own status-map addition
// newly maps for this route resolves to the status the table assigns, the
// DTO's own required non-empty input_schema/output_schema refuse a request
// omitting either outright before registerCapability is ever reached
// (defeating this task's own UNDERDETERMINED note), and no authentication
// guard stands in front of any of it.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { Capability, CapabilityRegistration } from '../../../capability-registry/capability.js';
import { CapabilityNotReadOnlyError } from '../../../errors/capability-not-read-only.error.js';
import { CapabilitySchemaNotWellFormedError } from '../../../errors/capability-schema-not-well-formed.error.js';
import { ConceptAlreadyAnsweredError } from '../../../errors/concept-already-answered.error.js';
import { ConnectorPlaceholderOutsideInputSchemaError } from '../../../errors/connector-placeholder-outside-input-schema.error.js';
import { MalformedCapabilityInputSchemaError } from '../../../errors/malformed-capability-input-schema.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { RegisterCapabilityControllerDependencies } from '../../../http/register-capability.controller.js';
import { createRegisterCapabilityRoutesPlugin } from '../../../http/register-capability.routes.js';

type RegisterCapabilityMock = ReturnType<typeof vi.fn<(registration: CapabilityRegistration) => Promise<Capability>>>;

/** Every attribute registerCapabilityBodySchema requires, both schemas syntactically valid JSON so a test proving one thing never incidentally trips the well-formedness or vocabulary refusals it is not about. */
function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    nature: 'read-only',
    input_schema: '{"type":"object"}',
    output_schema: '{"type":"object"}',
    connector: 'a-connector',
    concept: 'a-concept',
    ...overrides,
  };
}

/** A capability as the registry would answer it, every one of the eight declared attributes present, overridable per test. */
function heldCapability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: 'a-name',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: '{"type":"object"}',
    output_schema: '{"type":"object"}',
    timeout: 60_000,
    connector: 'a-connector',
    concept: 'a-concept',
    ...overrides,
  };
}

/** One Fastify instance registering exactly this route plugin plus the shared error handler — mirrors create-draft.routes.spec.ts's own buildTestApp. */
function buildTestApp(): { app: FastifyInstance; registerCapability: RegisterCapabilityMock } {
  const registerCapability: RegisterCapabilityMock = vi.fn();
  const dependencies: RegisterCapabilityControllerDependencies = { registerCapability };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createRegisterCapabilityRoutesPlugin(dependencies));
  return { app, registerCapability };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it('answers 200 with the held capability registerCapability resolved, for a valid registration at a (name, version) the path names', async () => {
  const built = buildTestApp();
  app = built.app;
  const registered = heldCapability();
  built.registerCapability.mockResolvedValueOnce(registered);

  const response = await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/1.0.0', payload: validBody() });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(registered);
});

it("composes the path-carried name and version with the body into one registration, calling registerCapability with it exactly", async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability.mockResolvedValueOnce(heldCapability());

  await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/1.0.0', payload: validBody() });

  expect(built.registerCapability).toHaveBeenCalledWith({
    name: 'a-name',
    version: '1.0.0',
    ...validBody(),
  });
});

// ------------------------------------------------------------------ criteria 1 & 2 — no caching across requests
//
// The route holds no create-or-replace logic of its own (this task's own
// disclosed inference: it answers 200 with whatever registerCapability
// resolves, for both the create case and the replace case) — the store-level
// fact that a second registration at a held (name, version) replaces the
// held record rather than adding a second one is CapabilityRegistryService's
// own concern, preserved unchanged by this task and already proved by
// capability-registry.service.spec.ts's own "replaces the held record when a
// held name and version register again". What this route can and does prove
// on its own is that it never answers a previous or cached resolution: each
// request's own response and each call's own arguments come from that
// request alone.

it("answers each of two requests at the same (name, version) with that request's own resolution, never a cached or joined value", async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability
    .mockResolvedValueOnce(heldCapability({ connector: 'first-connector' }))
    .mockResolvedValueOnce(heldCapability({ connector: 'second-connector' }));

  const first = await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/1.0.0', payload: validBody() });
  const second = await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/1.0.0', payload: validBody() });

  expect(first.statusCode).toBe(200);
  expect(second.statusCode).toBe(200);
  expect((first.json() as Capability).connector).toBe('first-connector');
  expect((second.json() as Capability).connector).toBe('second-connector');
  expect(built.registerCapability).toHaveBeenCalledTimes(2);
});

it('answers 200 rather than 201, both for a registration at a new (name, version) and for one at an already-held (name, version) — this task\'s own disclosed inference that the route does not distinguish the two by status', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability.mockResolvedValue(heldCapability());

  const response = await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/1.0.0', payload: validBody() });

  expect(response.statusCode).toBe(200);
});

// ------------------------------------------------------------------ inferred: PUT, never POST

it('answers 404 for a POST to the same URL, since this task\'s own disclosed inference registers the route under PUT alone', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'POST', url: '/v1/capabilities/a-name/1.0.0', payload: validBody() });

  expect(response.statusCode).toBe(404);
  expect(built.registerCapability).not.toHaveBeenCalled();
});

// ------------------------------------------------------------------ criterion 3

it('refuses with the status the status map assigns CapabilitySchemaNotWellFormedError, naming every malformed attribute in the details', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability.mockRejectedValueOnce(new CapabilitySchemaNotWellFormedError(['input_schema']));

  const response = await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/1.0.0', payload: validBody() });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CapabilitySchemaNotWellFormedError');
  expect(body.error.details).toEqual({ attributes: ['input_schema'] });
});

// Added for task/capability-input-schema-contract/refuse-malformed-capability-input-schema,
// whose own criteria 1-3 depend on this exact wiring: the status map's own new
// MalformedCapabilityInputSchemaError entry reaches this route the same way
// CapabilitySchemaNotWellFormedError already does above.

it('refuses with the status the status map assigns MalformedCapabilityInputSchemaError, naming every departure in the details', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability.mockRejectedValueOnce(
    new MalformedCapabilityInputSchemaError([
      'properties is not declared as an object',
      'required names a key absent from properties: a',
    ]),
  );

  const response = await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/1.0.0', payload: validBody() });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('MalformedCapabilityInputSchemaError');
  expect(body.error.details).toEqual({
    problems: [
      'properties is not declared as an object',
      'required names a key absent from properties: a',
    ],
  });
});

// ------------------------------------------------------------------ criterion 4

it('refuses with the status the status map assigns CapabilityNotReadOnlyError when the registry refuses a non-read-only nature', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability.mockRejectedValueOnce(new CapabilityNotReadOnlyError('mutating'));

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/capabilities/a-name/1.0.0',
    payload: validBody({ nature: 'mutating' }),
  });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('CapabilityNotReadOnlyError');
  expect(body.error.details).toEqual({ nature: 'mutating' });
});

it('answers 400 for an out-of-vocabulary nature, without ever reaching registerCapability', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/capabilities/a-name/1.0.0',
    payload: validBody({ nature: 'not-a-vocabulary-value' }),
  });

  expect(response.statusCode).toBe(400);
  expect(built.registerCapability).not.toHaveBeenCalled();
});

// ------------------------------------------------------------------ criterion 5

it('refuses with the status the status map assigns ConceptAlreadyAnsweredError when the registry refuses an already-answered concept', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability.mockRejectedValueOnce(
    new ConceptAlreadyAnsweredError('a-concept', { name: 'another-name', version: '1.0.0' }, { name: 'a-name', version: '1.0.0' }),
  );

  const response = await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/1.0.0', payload: validBody() });

  expect(response.statusCode).toBe(409);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('ConceptAlreadyAnsweredError');
  expect(body.error.details).toEqual({
    concept: 'a-concept',
    answeredBy: { name: 'another-name', version: '1.0.0' },
    registering: { name: 'a-name', version: '1.0.0' },
  });
});

// ------------------------------------------------------------------ task/connector-configuration-and-placeholder-contract/refuse-capability-registration-with-orphaned-placeholder
//
// This task's own criterion 1 depends on the status map's ConnectorPlaceholderOutsideInputSchemaError
// entry (already wired, and proven generically against 422 by status-map.spec.ts for the reciprocal
// register-connector direction) reaching this route exactly the way CapabilityNotReadOnlyError already
// does above: the route carries whatever registerCapability rejects with straight to the shared error
// handler, untouched by this task.

it('refuses with the status the status map assigns ConnectorPlaceholderOutsideInputSchemaError, naming every orphaned placeholder together with the capability that fails to declare it', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability.mockRejectedValueOnce(
    new ConnectorPlaceholderOutsideInputSchemaError([
      {
        placeholder: 'customer_document',
        capabilities: [{ connector: 'erp-http', input_schema: '{"properties":{}}' }],
      },
    ]),
  );

  const response = await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/1.0.0', payload: validBody() });

  expect(response.statusCode).toBe(422);
  const body = response.json() as { error: { code: string; details?: unknown } };
  expect(body.error.code).toBe('ConnectorPlaceholderOutsideInputSchemaError');
  expect(body.error.details).toEqual({
    orphaned: [
      {
        placeholder: 'customer_document',
        capabilities: [{ connector: 'erp-http', input_schema: '{"properties":{}}' }],
      },
    ],
  });
});

// ------------------------------------------------------------------ criterion 6

it('calls registerCapability with no timeout key when the request body states none, leaving the default to the registry rather than defaulting it here', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability.mockResolvedValueOnce(heldCapability());
  const bodyWithoutTimeout = validBody();

  await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/1.0.0', payload: bodyWithoutTimeout });

  const [calledWith] = built.registerCapability.mock.calls[0] as [CapabilityRegistration];
  expect(calledWith).not.toHaveProperty('timeout');
});

it('passes a stated timeout through to registerCapability unchanged, never substituting the default for it', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability.mockResolvedValueOnce(heldCapability({ timeout: 5_000 }));

  await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/1.0.0', payload: validBody({ timeout: 5_000 }) });

  const [calledWith] = built.registerCapability.mock.calls[0] as [CapabilityRegistration];
  expect(calledWith.timeout).toBe(5_000);
});

it("answers 400 for a timeout of 0, one below the schema's own positive lower boundary, without ever reaching registerCapability", async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/capabilities/a-name/1.0.0',
    payload: validBody({ timeout: 0 }),
  });

  expect(response.statusCode).toBe(400);
  expect(built.registerCapability).not.toHaveBeenCalled();
});

// ------------------------------------------------------------------ task/capability-timeout-contract-refusal/non-integer-timeout-refusal
//
// A declared timeout that is present but not an integer count of
// milliseconds is refused here, at the route's own declared shape
// (registerCapabilityBodySchema's timeout:z.number().int().positive().optional()),
// rather than by capability-registry.service.ts's contract-completeness
// check — this task's own "What it is". These four also pin the
// implementation's own disclosed inference that no change to
// registerCapabilityBodySchema was needed: the existing schema, unmodified,
// already answers every case below.

it('refuses a registration whose timeout is a decimal number, answering 400 VALIDATION_ERROR rather than registering it', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/capabilities/a-name/1.0.0',
    payload: validBody({ timeout: 0.5 }),
  });

  expect(response.statusCode).toBe(400);
  expect((response.json() as { error: { code: string } }).error.code).toBe('VALIDATION_ERROR');
  expect(built.registerCapability).not.toHaveBeenCalled();
});

it('refuses a registration whose timeout is a numeric string, answering 400 VALIDATION_ERROR rather than registering it', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/capabilities/a-name/1.0.0',
    payload: validBody({ timeout: '60000' }),
  });

  expect(response.statusCode).toBe(400);
  expect((response.json() as { error: { code: string } }).error.code).toBe('VALIDATION_ERROR');
  expect(built.registerCapability).not.toHaveBeenCalled();
});

it('refuses a decimal timeout and a numeric-string timeout alike with the identical status and the identical named error, rather than either falling through to a different or default response', async () => {
  const built = buildTestApp();
  app = built.app;

  const decimalResponse = await app.inject({
    method: 'PUT',
    url: '/v1/capabilities/a-name/1.0.0',
    payload: validBody({ timeout: 0.5 }),
  });
  const numericStringResponse = await app.inject({
    method: 'PUT',
    url: '/v1/capabilities/a-name/1.0.0',
    payload: validBody({ timeout: '60000' }),
  });

  expect(decimalResponse.statusCode).toBe(numericStringResponse.statusCode);
  expect(decimalResponse.statusCode).toBe(400);
  expect((decimalResponse.json() as { error: { code: string } }).error.code).toBe(
    (numericStringResponse.json() as { error: { code: string } }).error.code,
  );
  expect((decimalResponse.json() as { error: { code: string } }).error.code).toBe('VALIDATION_ERROR');
  expect(built.registerCapability).not.toHaveBeenCalled();
});

it("answers the non-integer-timeout refusal distinctly from the registry's response to a capability that declares no timeout at all: a decimal timeout is refused with 400 while an absent timeout reaches registerCapability and takes the registry's own sixty-second default", async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability.mockResolvedValueOnce(heldCapability());

  const nonIntegerResponse = await app.inject({
    method: 'PUT',
    url: '/v1/capabilities/a-name/1.0.0',
    payload: validBody({ timeout: 0.5 }),
  });
  const absentTimeoutResponse = await app.inject({
    method: 'PUT',
    url: '/v1/capabilities/a-name/1.0.0',
    payload: validBody(),
  });

  expect(nonIntegerResponse.statusCode).toBe(400);
  expect(absentTimeoutResponse.statusCode).toBe(200);
  const [calledWith] = built.registerCapability.mock.calls[0] as [CapabilityRegistration];
  expect(calledWith).not.toHaveProperty('timeout');
});

// ------------------------------------------------------------------ criterion 7

it('answers 200 for a request carrying no headers at all, reading no authentication or authorization header', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability.mockResolvedValueOnce(heldCapability());

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/capabilities/a-name/1.0.0',
    payload: validBody(),
    headers: {},
  });

  expect(response.statusCode).toBe(200);
});

it('answers 200 for a request carrying an authorization header naming no credential this route recognizes, dispatching it exactly as one that carries none', async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability.mockResolvedValueOnce(heldCapability());

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/capabilities/a-name/1.0.0',
    payload: validBody(),
    headers: { authorization: 'Bearer not-a-real-credential' },
  });

  expect(response.statusCode).toBe(200);
});

// ------------------------------------------------------------------ UNDERDETERMINED-defeating tests
//
// This task's own UNDERDETERMINED note rules out a reading where a
// registration whose request body omits input_schema or output_schema
// outright is accepted — storing an empty or null value for the missing
// attribute and answering success — rather than refused for lacking its
// declared contract. registerCapabilityBodySchema requires both as non-empty
// strings (never .optional()), so the DTO itself refuses such a request
// before registerCapability is ever reached; these two tests prove exactly
// that, failing over an implementation matching the excluded reading (one
// that lets the request through and calls registerCapability with the
// attribute absent or empty).

it('refuses a registration whose body omits input_schema outright, never calling registerCapability with it absent or empty', async () => {
  const built = buildTestApp();
  app = built.app;
  const bodyWithoutInputSchema: Record<string, unknown> = validBody();
  delete bodyWithoutInputSchema.input_schema;

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/capabilities/a-name/1.0.0',
    payload: bodyWithoutInputSchema,
  });

  expect(response.statusCode).toBe(400);
  expect(built.registerCapability).not.toHaveBeenCalled();
});

it('refuses a registration whose body omits output_schema outright, never calling registerCapability with it absent or empty', async () => {
  const built = buildTestApp();
  app = built.app;
  const bodyWithoutOutputSchema: Record<string, unknown> = validBody();
  delete bodyWithoutOutputSchema.output_schema;

  const response = await app.inject({
    method: 'PUT',
    url: '/v1/capabilities/a-name/1.0.0',
    payload: bodyWithoutOutputSchema,
  });

  expect(response.statusCode).toBe(400);
  expect(built.registerCapability).not.toHaveBeenCalled();
});

// ------------------------------------------------------------------ edge cases

it('answers 400 for a wholly empty body, without ever reaching registerCapability', async () => {
  const built = buildTestApp();
  app = built.app;

  const response = await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/1.0.0', payload: {} });

  expect(response.statusCode).toBe(400);
  expect(built.registerCapability).not.toHaveBeenCalled();
});

it(
  'answers 400 via validation for a request with an empty :name segment, never 404 "route not found" — Fastify still matches the ' +
    'route with an empty string param for this segment, and registerCapabilityParamsSchema (z.string().min(1)) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'PUT', url: '/v1/capabilities//1.0.0', payload: validBody() });

    expect(response.statusCode).toBe(400);
    expect(built.registerCapability).not.toHaveBeenCalled();
  },
);

it(
  'answers 400 via validation for a request with an empty :version segment, never 404 "route not found" — Fastify still matches the ' +
    'route with an empty string param for this segment, and registerCapabilityParamsSchema (z.string().min(1)) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/', payload: validBody() });

    expect(response.statusCode).toBe(400);
    expect(built.registerCapability).not.toHaveBeenCalled();
  },
);

it("answers the unchanged generic envelope, never the rejected call's own error text, when registerCapability rejects with a generic, non-domain error", async () => {
  const built = buildTestApp();
  app = built.app;
  built.registerCapability.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'PUT', url: '/v1/capabilities/a-name/1.0.0', payload: validBody() });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
  expect(response.body).not.toContain('a sensitive internal detail nobody outside the server should see');
});
