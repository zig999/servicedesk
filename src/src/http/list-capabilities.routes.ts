// Registers GET /v1/capabilities (task/capability-registry-http/list-capabilities-route,
// contracts/integration/capability-registry): validates the query string against
// listCapabilitiesQuerySchema before the controller is ever reached (DTO-01, EDG-01), then hands
// the parsed DTO straight to handleListCapabilitiesRequest and answers with whatever page it
// resolves. The route sits under the same versioned prefix diagnose.routes.ts and
// read-capability.routes.ts already establish (API-06), and this module constructs none of its
// own dependencies (ARC-02) — they arrive as this plugin's own closure, built once by whichever
// factory eventually wires this route (mirroring createCapabilityQuery for
// read-capability-route). ICapabilityQuery.listCapabilities raises no domain error of its own
// (list-capabilities.controller.ts's own header comment), so this plugin sets no error handler
// of its own here either — it answers through whichever one the app already has registered
// (COR-04, error-handler.middleware.ts), exactly as list-cases.routes.ts already leaves every
// propagated error to it.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleListCapabilitiesRequest,
  type ListCapabilitiesControllerDependencies,
} from './list-capabilities.controller.js';
import { listCapabilitiesQuerySchema } from './dto/list-capabilities.dto.js';

/** A versioned prefix (API-06), matching diagnose.routes.ts's and read-capability.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the list-capabilities route as a Fastify plugin closed over the given dependencies —
 * the published capability-registry read plus the configured pagination bound — so the plugin
 * body itself constructs nothing (ARC-02).
 */
export function createListCapabilitiesRoutesPlugin(
  dependencies: ListCapabilitiesControllerDependencies,
): FastifyPluginAsync {
  return async function listCapabilitiesRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/capabilities`, (request, reply) => listCapabilitiesHandler(dependencies, request, reply));
  };
}

/**
 * Validates the query string before the controller is reached (DTO-01, EDG-01): an offset or
 * limit present but failing listCapabilitiesQuerySchema — negative, non-numeric or otherwise
 * malformed — answers 400 with the validation envelope, naming every violated field; otherwise
 * the controller's own resolved page answers 200, unchanged.
 */
async function listCapabilitiesHandler(
  dependencies: ListCapabilitiesControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = listCapabilitiesQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request query failed validation', details: issues } });
  }
  const page = await handleListCapabilitiesRequest(dependencies, parsed.data);
  return reply.code(200).send(page);
}
