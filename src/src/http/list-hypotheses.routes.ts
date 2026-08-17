// Registers GET /v1/cases/{slug}/hypotheses
// (task/case-query-http/list-hypotheses-route, contracts/knowledge/case-query):
// validates the :slug path parameter and the query string against
// listHypothesesParamsSchema/listHypothesesQuerySchema before the
// controller is ever reached (DTO-01, EDG-01), then hands both parsed DTOs
// straight to handleListHypothesesRequest and answers with whatever page it
// resolves. The route sits under the same versioned prefix
// diagnose.routes.ts, read-case.routes.ts, list-cases.routes.ts and
// list-case-versions.routes.ts already establish (API-06), and this module
// constructs none of its own dependencies (ARC-02) — they arrive as this
// plugin's own closure, built once by whichever factory eventually wires
// this route (mirroring createCaseQuery for read-case-route). A slug naming
// no case is left to raise CaseNotFoundError, which this plugin sets no
// error handler of its own to catch: it answers through whichever one the
// app already has registered (COR-04, error-handler.middleware.ts), exactly
// as list-case-versions.routes.ts already leaves every propagated error to
// it for its own :slug path parameter.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleListHypothesesRequest, type ListHypothesesControllerDependencies } from './list-hypotheses.controller.js';
import { listHypothesesParamsSchema, listHypothesesQuerySchema } from './dto/list-hypotheses.dto.js';

/** A versioned prefix (API-06), matching diagnose.routes.ts's, read-case.routes.ts's, list-cases.routes.ts's and list-case-versions.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the list-hypotheses route as a Fastify plugin closed over the
 * given dependencies — the published knowledge-context read plus the
 * configured pagination bound — so the plugin body itself constructs
 * nothing (ARC-02).
 */
export function createListHypothesesRoutesPlugin(
  dependencies: ListHypothesesControllerDependencies,
): FastifyPluginAsync {
  return async function listHypothesesRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/cases/:slug/hypotheses`, (request, reply) => listHypothesesHandler(dependencies, request, reply));
  };
}

/**
 * Validates the :slug path parameter and the query string before the
 * controller is reached (DTO-01, EDG-01): an empty :slug, or an offset or
 * limit present but failing listHypothesesQuerySchema — negative,
 * non-numeric or otherwise malformed — answers 400 with the validation
 * envelope, naming every violated field; otherwise the controller's own
 * resolved page answers 200, unchanged, and a thrown CaseNotFoundError is
 * left to reach the app's shared error handler.
 */
async function listHypothesesHandler(
  dependencies: ListHypothesesControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = listHypothesesParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedQuery = listHypothesesQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    const issues = parsedQuery.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request query failed validation', details: issues } });
  }
  const page = await handleListHypothesesRequest(dependencies, parsedParams.data.slug, parsedQuery.data);
  return reply.code(200).send(page);
}
