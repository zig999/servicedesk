// Registers DELETE /v1/cases/{slug}/versions/{version}
// (task/case-lifecycle-http/discard-route, contracts/knowledge/case-lifecycle):
// validates the two path parameters against discardParamsSchema before the
// controller is ever reached (DTO-01, EDG-01), then hands the parsed DTO
// straight to handleDiscardRequest and answers 204 with no body once it
// resolves. The route sits under the same versioned prefix
// update-draft.routes.ts and read-case.routes.ts already establish (API-06),
// and this module constructs none of its own dependencies (ARC-02) — they
// arrive as this plugin's own closure, built once by whichever factory
// eventually wires this route into the running app
// (task/case-lifecycle-http/register-routes-in-build-app, not this task's
// own concern). A domain refusal the controller leaves to propagate
// (CaseNotFoundError, CaseVersionNotDraftError) sets no error handler of its
// own here: this plugin answers through whichever one the app already has
// registered (COR-04, error-handler.middleware.ts), exactly as
// update-draft.routes.ts already leaves every propagated error to it.
//
// Unlike update-draft.routes.ts, there is no request body to validate here:
// discard takes only the two path parameters, and the success answer is 204
// with an empty body — this task's own first use of that status in this
// codebase (no existing route in this HTTP surface answers 204 today) — the
// standard HTTP semantics for a DELETE that removed its resource and has
// nothing left to describe.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleDiscardRequest, type DiscardControllerDependencies } from './discard.controller.js';
import { discardParamsSchema } from './dto/discard.dto.js';

/** A versioned prefix (API-06), matching update-draft.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the discard route as a Fastify plugin closed over the given
 * dependencies — a narrowed slice of the published case-lifecycle
 * operations, just the discard function — so the plugin body itself
 * constructs nothing (ARC-02).
 */
export function createDiscardRoutesPlugin(dependencies: DiscardControllerDependencies): FastifyPluginAsync {
  return async function discardRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.delete(`${API_PREFIX}/cases/:slug/versions/:version`, (request, reply) => discardHandler(dependencies, request, reply));
  };
}

/**
 * Validates the path parameters before the controller is reached (DTO-01,
 * EDG-01): a :slug or :version failing discardParamsSchema — including a
 * non-numeric :version — answers 400 with the validation envelope, naming
 * every violated field; otherwise the controller runs to completion and the
 * route answers 204 with no body, and a thrown CaseNotFoundError or
 * CaseVersionNotDraftError is left to reach the app's shared error handler.
 */
async function discardHandler(
  dependencies: DiscardControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = discardParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  await handleDiscardRequest(dependencies, parsedParams.data);
  return reply.code(204).send();
}
