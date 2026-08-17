// Registers GET /v1/cases (task/case-query-http/list-cases-route,
// contracts/knowledge/case-query): validates the query string against
// listCasesQuerySchema before the controller is ever reached (DTO-01,
// EDG-01), then hands the parsed DTO straight to handleListCasesRequest and
// answers with whatever page it resolves. The route sits under the same
// versioned prefix diagnose.routes.ts and read-case.routes.ts already
// establish (API-06), and this module constructs none of its own
// dependencies (ARC-02) — they arrive as this plugin's own closure, built
// once by whichever factory eventually wires this route (mirroring
// createCaseQuery for read-case-route). CaseQueryService.listCases raises no
// domain error of its own (list-cases.controller.ts's own header comment),
// so this plugin sets no error handler of its own here either — it answers
// through whichever one the app already has registered (COR-04,
// error-handler.middleware.ts), exactly as read-case.routes.ts already
// leaves every propagated error to it.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleListCasesRequest, type ListCasesControllerDependencies } from './list-cases.controller.js';
import { listCasesQuerySchema } from './dto/list-cases.dto.js';

/** A versioned prefix (API-06), matching diagnose.routes.ts's and read-case.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the list-cases route as a Fastify plugin closed over the given
 * dependencies — the published knowledge-context read plus the configured
 * pagination bound — so the plugin body itself constructs nothing (ARC-02).
 */
export function createListCasesRoutesPlugin(dependencies: ListCasesControllerDependencies): FastifyPluginAsync {
  return async function listCasesRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/cases`, (request, reply) => listCasesHandler(dependencies, request, reply));
  };
}

/**
 * Validates the query string before the controller is reached (DTO-01,
 * EDG-01): an offset or limit present but failing listCasesQuerySchema —
 * negative, non-numeric or otherwise malformed — answers 400 with the
 * validation envelope, naming every violated field; otherwise the
 * controller's own resolved page answers 200, unchanged.
 */
async function listCasesHandler(
  dependencies: ListCasesControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = listCasesQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request query failed validation', details: issues } });
  }
  const page = await handleListCasesRequest(dependencies, parsed.data);
  return reply.code(200).send(page);
}
