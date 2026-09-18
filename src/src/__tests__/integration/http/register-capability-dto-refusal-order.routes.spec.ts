import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import { createRegisterCapabilityRoutesPlugin } from '../../../http/register-capability.routes.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

type ErrorResponseBody = { readonly error: { readonly code: string; readonly details?: { readonly problems?: readonly string[] } } };

function completeBody(id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    nature: 'read-only',
    input_schema: '{}',
    output_schema: '{}',
    connector: 'a-connector',
    concept: `register-capability-dto-refusal-order-concept-${id}`,
    ...overrides,
  };
}

let pool: DatabaseConnection;
let app: FastifyInstance;

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl(), { maxConnections: 10, idleTimeoutMs: 10_000, statementTimeoutMs: 30_000 });
  const registry = createCapabilityRegistry(pool);
  app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createRegisterCapabilityRoutesPlugin({ registerCapability: (registration) => registry.registerCapability(registration) }));
});

afterAll(async () => {
  await app.close();
  await pool.end();
});

let capabilitiesWrittenByThisTest: Array<{ name: string; version: string }> = [];
let conceptsWrittenByThisTest: string[] = [];

afterEach(async () => {
  if (capabilitiesWrittenByThisTest.length > 0) {
    for (const { name, version } of capabilitiesWrittenByThisTest) {
      await pool.query('DELETE FROM capabilities WHERE name = $1 AND version = $2', [name, version]);
    }
    capabilitiesWrittenByThisTest = [];
  }
  if (conceptsWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
    conceptsWrittenByThisTest = [];
  }
});

it('answers HTTP 422 IncompleteCapabilityContractError naming connector, not HTTP 400 VALIDATION_ERROR, when the body omits connector', async () => {
  const id = randomUUID();
  const body = completeBody(id);
  delete body.connector;

  const response = await app.inject({
    method: 'PUT',
    url: `/v1/capabilities/register-capability-dto-refusal-order-name-${id}/1.0.0`,
    payload: body,
  });

  expect(response.statusCode).toBe(422);
  const responseBody = response.json() as ErrorResponseBody;
  expect(responseBody.error.code).toBe('IncompleteCapabilityContractError');
  expect(responseBody.error.details?.problems).toContain('connector is undeclared');
});

it('answers HTTP 422 IncompleteCapabilityContractError naming connector, not HTTP 400 VALIDATION_ERROR, when the body states connector as an empty string', async () => {
  const id = randomUUID();

  const response = await app.inject({
    method: 'PUT',
    url: `/v1/capabilities/register-capability-dto-refusal-order-name-${id}/1.0.0`,
    payload: completeBody(id, { connector: '' }),
  });

  expect(response.statusCode).toBe(422);
  const responseBody = response.json() as ErrorResponseBody;
  expect(responseBody.error.code).toBe('IncompleteCapabilityContractError');
  expect(responseBody.error.details?.problems).toContain('connector is undeclared');
});

it('accepts a submission stating every required attribute with payload_notes left undeclared, and the held capability answers with no payload_notes value', async () => {
  const id = randomUUID();
  const concept = `register-capability-dto-refusal-order-concept-${id}`;
  const name = `register-capability-dto-refusal-order-name-${id}`;
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [concept]);
  conceptsWrittenByThisTest.push(concept);
  capabilitiesWrittenByThisTest.push({ name, version: '1.0.0' });

  const response = await app.inject({
    method: 'PUT',
    url: `/v1/capabilities/${name}/1.0.0`,
    payload: completeBody(id),
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).not.toHaveProperty('payload_notes');
});

it("still refuses with HTTP 400 VALIDATION_ERROR a submission whose timeout holds the wrong type (a non-numeric string), independent of this task's own loosening of the required string attributes", async () => {
  const id = randomUUID();

  const response = await app.inject({
    method: 'PUT',
    url: `/v1/capabilities/register-capability-dto-refusal-order-name-${id}/1.0.0`,
    payload: completeBody(id, { timeout: 'not-a-number' }),
  });

  expect(response.statusCode).toBe(400);
  expect((response.json() as ErrorResponseBody).error.code).toBe('VALIDATION_ERROR');
});
