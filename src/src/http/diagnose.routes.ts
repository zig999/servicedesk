// Registers POST /v1/diagnose (task/http-surface/diagnose-http-endpoint,
// contracts/investigation/diagnosis): validates the raw body against
// diagnoseRequestSchema before the controller is ever reached (DTO-01,
// EDG-01), then hands the parsed DTO straight to handleDiagnoseRequest and
// answers with whatever it resolves. The route sits under a versioned
// prefix (API-06), and this module constructs none of its own dependencies
// (ARC-02) — they arrive as this plugin's own closure, built once by
// createDiagnoseHttpServer. Nothing here reads request.headers at all, so
// the requester the response is computed under is exactly the one the
// request body named — no authentication or authorization header is read.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleDiagnoseRequest, type DiagnoseControllerDependencies } from './diagnose.controller.js';
import { diagnoseRequestSchema } from './dto/diagnose.dto.js';

/** A versioned prefix (API-06): the one route this MVP exposes sits under it, so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the diagnose route as a Fastify plugin closed over the given
 * dependencies — the published case read, the wired production runner and
 * the configured model/prompt_version — so the plugin body itself
 * constructs nothing (ARC-02); createDiagnoseHttpServer is the one factory
 * that builds every one of them.
 */
export function createDiagnoseRoutesPlugin(dependencies: DiagnoseControllerDependencies): FastifyPluginAsync {
  return async function diagnoseRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/diagnose`, (request, reply) => diagnoseHandler(dependencies, request, reply));
  };
}

/**
 * Validates the raw body before the controller is reached (DTO-01, EDG-01):
 * a body failing diagnoseRequestSchema answers 400 with the validation
 * envelope, naming every violated field; otherwise the controller's own
 * resolved assessment answers 200, unchanged.
 */
async function diagnoseHandler(
  dependencies: DiagnoseControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = diagnoseRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const assessment = await handleDiagnoseRequest(dependencies, parsed.data);
  return reply.code(200).send(assessment);
}
