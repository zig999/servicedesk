// Registers GET /v1/cases/{slug}/versions/{version}/input-requirements
// (contracts/knowledge/case-input-requirements): validates the two path
// parameters against caseInputRequirementsParamsSchema before the controller
// is ever reached (DTO-01, EDG-01), then hands the parsed DTO straight to
// handleReadCaseInputRequirementsRequest and answers with whatever it
// resolves. The route sits under the same versioned prefix
// read-case.routes.ts already established (API-06), one segment past
// read-case's own path since this reads one version's own derived
// requirements rather than the version itself, and this module constructs
// none of its own dependencies (ARC-02) — they arrive as this plugin's own
// closure, built once by whichever factory wires this route into the
// running app (src/factories/case-input-requirements.factory.ts's own
// createCaseInputRequirementsQuery). A domain refusal the controller leaves
// to propagate (CaseNotFoundError, CaseNotValidError) sets no error handler
// of its own here: this plugin answers through whichever one the app already
// has registered (COR-04, error-handler.middleware.ts), exactly as
// read-case.routes.ts already leaves both to it.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReadCaseInputRequirementsRequest,
  type CaseInputRequirementsControllerDependencies,
} from './case-input-requirements.controller.js';
import { caseInputRequirementsParamsSchema } from './dto/case-input-requirements.dto.js';

/** A versioned prefix (API-06), matching read-case.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the read-case-input-requirements route as a Fastify plugin closed
 * over the given dependencies — the published case-input-requirements read —
 * so the plugin body itself constructs nothing (ARC-02).
 */
export function createCaseInputRequirementsRoutesPlugin(
  dependencies: CaseInputRequirementsControllerDependencies,
): FastifyPluginAsync {
  return async function caseInputRequirementsRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/cases/:slug/versions/:version/input-requirements`, (request, reply) =>
      caseInputRequirementsHandler(dependencies, request, reply),
    );
  };
}

/**
 * Validates both path parameters before the controller is reached (DTO-01,
 * EDG-01): a :slug or :version failing caseInputRequirementsParamsSchema —
 * including a non-numeric :version — answers 400 with the validation
 * envelope, naming every violated field; otherwise the controller's own
 * resolved result answers 200, unchanged, and a thrown CaseNotFoundError or
 * CaseNotValidError is left to reach the app's shared error handler.
 */
async function caseInputRequirementsHandler(
  dependencies: CaseInputRequirementsControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = caseInputRequirementsParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const result = await handleReadCaseInputRequirementsRequest(dependencies, parsed.data);
  return reply.code(200).send(result);
}
