// Registers GET /v1/cases/{slug}/versions/{version}
// (task/case-query-http/read-case-route, contracts/knowledge/case-query):
// validates the two path parameters against readCaseParamsSchema before the
// controller is ever reached (DTO-01, EDG-01), then hands the parsed DTO
// straight to handleReadCaseRequest and answers with whatever it resolves.
// The route sits under the same versioned prefix diagnose.routes.ts already
// established (API-06), and this module constructs none of its own
// dependencies (ARC-02) — they arrive as this plugin's own closure, built
// once by whichever factory wires this route into the running app
// (src/factories/case-query.factory.ts's own createCaseQuery). A domain
// refusal the controller leaves to propagate (CaseNotFoundError,
// CaseNotValidError) sets no error handler of its own here: this plugin
// answers through whichever one the app already has registered (COR-04,
// error-handler.middleware.ts), exactly as read-capability.routes.ts already
// leaves every propagated error to it.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleReadCaseRequest, type ReadCaseControllerDependencies } from './read-case.controller.js';
import { readCaseParamsSchema } from './dto/read-case.dto.js';

/** A versioned prefix (API-06), matching diagnose.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the read-case route as a Fastify plugin closed over the given
 * dependencies — the published knowledge-context read — so the plugin body
 * itself constructs nothing (ARC-02).
 */
export function createReadCaseRoutesPlugin(dependencies: ReadCaseControllerDependencies): FastifyPluginAsync {
  return async function readCaseRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/cases/:slug/versions/:version`, (request, reply) => readCaseHandler(dependencies, request, reply));
  };
}

/**
 * Validates both path parameters before the controller is reached (DTO-01,
 * EDG-01): a :slug or :version failing readCaseParamsSchema — including a
 * non-numeric :version — answers 400 with the validation envelope, naming
 * every violated field; otherwise the controller's own resolved case
 * answers 200, unchanged, and a thrown CaseNotFoundError or
 * CaseNotValidError is left to reach the app's shared error handler.
 */
async function readCaseHandler(
  dependencies: ReadCaseControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = readCaseParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const caseVersion = await handleReadCaseRequest(dependencies, parsed.data);
  return reply.code(200).send(caseVersion);
}
