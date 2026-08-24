// Registers POST /v1/test-connector
// (task/connector-diagnostics/test-connector-route,
// contracts/integration/connector-diagnostics,
// rules/integration/a-connector-configuration-is-tested-through-a-registered-capability):
// validates the raw body against testConnectorRequestSchema before the
// controller is ever reached (DTO-01, EDG-01), then hands the parsed DTO
// straight to handleTestConnectorRequest and answers with whatever it
// resolves. The route sits under the same versioned prefix every sibling
// route already establishes (API-06), and this module constructs none of
// its own dependencies (ARC-02) — they arrive as this plugin's own closure,
// built once by build-app.factory.ts's own composeResources, reusing the
// same CapabilityRegistryService and ConnectorConfigurationRegistryService
// instances every sibling registry route already shares. A domain refusal
// the controller raises (CapabilityNotRegisteredForTestError,
// CapabilityConnectorMismatchError, ConnectorConfigurationNotFoundError) is
// left to propagate: this plugin sets no error handler of its own, so it
// answers through whichever one the app already has registered (COR-04,
// error-handler.middleware.ts). This route declares no authentication guard
// of its own (criterion 7, constraints/no-route-enforces-authentication):
// nothing here reads request.headers at all, so the requester the request
// is dispatched under is exactly the one the request body named — mirroring
// diagnose.routes.ts's own posture exactly.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleTestConnectorRequest, type TestConnectorControllerDependencies } from './test-connector.controller.js';
import { testConnectorRequestSchema } from './dto/test-connector.dto.js';

/** A versioned prefix (API-06), matching every sibling route's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the test-connector route as a Fastify plugin closed over the given
 * dependencies — the published capability-by-identity read, the published
 * connector-configuration read, and the HTTP client to issue the real call
 * through — so the plugin body itself constructs nothing (ARC-02).
 */
export function createTestConnectorRoutesPlugin(dependencies: TestConnectorControllerDependencies): FastifyPluginAsync {
  return async function testConnectorRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/test-connector`, (request, reply) => testConnectorHandler(dependencies, request, reply));
  };
}

/**
 * Validates the raw body before the controller is reached (DTO-01, EDG-01):
 * a body failing testConnectorRequestSchema answers 400 with the validation
 * envelope, naming every violated field; otherwise the controller's own
 * resolved outcome answers 200, unchanged, and a thrown domain refusal is
 * left to reach the app's shared error handler.
 */
async function testConnectorHandler(
  dependencies: TestConnectorControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = testConnectorRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const outcome = await handleTestConnectorRequest(dependencies, parsed.data);
  return reply.code(200).send(outcome);
}
