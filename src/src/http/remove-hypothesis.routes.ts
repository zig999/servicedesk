// Registers DELETE /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}
// (task/case-lifecycle-http/remove-hypothesis-route, contracts/knowledge/case-lifecycle):
// validates the three path parameters against removeHypothesisParamsSchema
// before the controller is ever reached (DTO-01, EDG-01), then hands the
// parsed DTO straight to handleRemoveHypothesisRequest and answers 204 with
// no body once it resolves. The route sits under the same versioned prefix
// discard.routes.ts, update-draft.routes.ts and release.routes.ts already
// establish (API-06), and this module constructs none of its own
// dependencies (ARC-02) — they arrive as this plugin's own closure, built
// once by whichever factory eventually wires this route into the running
// app (task/case-lifecycle-http/register-routes-in-build-app, not this
// task's own concern). A domain refusal the controller leaves to propagate
// (CaseNotFoundError, CaseVersionNotDraftError,
// ManifestWouldHoldNoHypothesisError) sets no error handler of its own here:
// this plugin answers through whichever one the app already has registered
// (COR-04, error-handler.middleware.ts), exactly as discard.routes.ts
// already leaves every propagated error to it.
//
// There is no request body to validate here, mirroring discard.routes.ts's
// own signature: remove-hypothesis takes only its three path parameters, and
// the success answer is 204 with an empty body, mirroring discard.routes.ts's
// own empty-body convention exactly (this task's own criterion 1).

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleRemoveHypothesisRequest, type RemoveHypothesisControllerDependencies } from './remove-hypothesis.controller.js';
import { removeHypothesisParamsSchema } from './dto/remove-hypothesis.dto.js';

/** A versioned prefix (API-06), matching discard.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the remove-hypothesis route as a Fastify plugin closed over the
 * given dependencies — a narrowed slice of the published case-lifecycle
 * operations, just the removeHypothesis function — so the plugin body
 * itself constructs nothing (ARC-02).
 */
export function createRemoveHypothesisRoutesPlugin(dependencies: RemoveHypothesisControllerDependencies): FastifyPluginAsync {
  return async function removeHypothesisRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.delete(`${API_PREFIX}/cases/:slug/versions/:version/manifest/:hypothesis_name`, (request, reply) =>
      removeHypothesisHandler(dependencies, request, reply),
    );
  };
}

/**
 * Validates the path parameters before the controller is reached (DTO-01,
 * EDG-01): a :slug, :version or :hypothesis_name failing
 * removeHypothesisParamsSchema — including a non-numeric :version — answers
 * 400 with the validation envelope, naming every violated field; otherwise
 * the controller runs to completion and the route answers 204 with no body,
 * and a thrown CaseNotFoundError, CaseVersionNotDraftError or
 * ManifestWouldHoldNoHypothesisError is left to reach the app's shared error
 * handler.
 */
async function removeHypothesisHandler(
  dependencies: RemoveHypothesisControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = removeHypothesisParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  await handleRemoveHypothesisRequest(dependencies, parsedParams.data);
  return reply.code(204).send();
}
