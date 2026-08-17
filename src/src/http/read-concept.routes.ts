// Registers GET /v1/glossary/concepts/{name} (task/glossary-query-http/read-concept-route,
// contracts/glossary/glossary-query): validates the path parameter against
// readConceptParamsSchema before the controller is ever reached (DTO-01, EDG-01), then hands the
// parsed DTO straight to handleReadConceptRequest and answers with whatever it resolves. The route
// sits under the same versioned prefix diagnose.routes.ts already established (API-06), and this
// module constructs none of its own dependencies (ARC-02) — they arrive as this plugin's own
// closure, built once by whichever factory wires this route into the running app. A domain refusal
// the controller raises (ConceptNotHeldError) is left to propagate: this plugin sets no error
// handler of its own, so it answers through whichever one the app already has registered (COR-04,
// error-handler.middleware.ts), exactly as read-capability.routes.ts leaves every propagated error
// to it today.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReadConceptRequest,
  type ReadConceptControllerDependencies,
} from './read-concept.controller.js';
import { readConceptParamsSchema } from './dto/read-concept.dto.js';

/** A versioned prefix (API-06), matching diagnose.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the read-concept route as a Fastify plugin closed over the given dependencies — the
 * published glossary-query read — so the plugin body itself constructs nothing (ARC-02).
 */
export function createReadConceptRoutesPlugin(
  dependencies: ReadConceptControllerDependencies,
): FastifyPluginAsync {
  return async function readConceptRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/glossary/concepts/:name`, (request, reply) => readConceptHandler(dependencies, request, reply));
  };
}

/**
 * Validates the path parameter before the controller is reached (DTO-01, EDG-01): a request whose
 * :name segment fails readConceptParamsSchema answers 400 with the validation envelope, naming
 * every violated field; otherwise the controller's own resolved concept answers 200, unchanged, and
 * a thrown ConceptNotHeldError is left to reach the app's shared error handler.
 */
async function readConceptHandler(
  dependencies: ReadConceptControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = readConceptParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const concept = await handleReadConceptRequest(dependencies, parsed.data);
  return reply.code(200).send(concept);
}
