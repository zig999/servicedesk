// Registers PUT /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}
// (task/case-lifecycle-http/place-hypothesis-route, contracts/knowledge/case-lifecycle):
// validates the three path parameters against placeHypothesisParamsSchema
// and the request body against placeHypothesisBodySchema before the
// controller is ever reached (DTO-01, EDG-01), then hands both parsed DTOs
// straight to handlePlaceHypothesisRequest and answers 204 with no body once
// it resolves. The route sits under the same versioned prefix
// diagnose.routes.ts, read-case.routes.ts, update-draft.routes.ts,
// release.routes.ts and discard.routes.ts already establish (API-06), and
// this module constructs none of its own dependencies (ARC-02) — they arrive
// as this plugin's own closure, built once by whichever factory eventually
// wires this route into the running app
// (task/case-lifecycle-http/register-routes-in-build-app, not this task's
// own concern). A domain refusal the controller leaves to propagate
// (CaseNotFoundError, CaseVersionNotDraftError, ManifestPositionOccupiedError)
// sets no error handler of its own here: this plugin answers through
// whichever one the app already has registered (COR-04,
// error-handler.middleware.ts), exactly as update-draft.routes.ts and
// discard.routes.ts already leave every propagated error to it.
//
// Like discard.routes.ts and unlike update-draft.routes.ts/release.routes.ts,
// the success answer is 204 with an empty body: this task's own criterion 1
// states only that the placement happens, never that the route answers with
// a projected wire shape, and the controller itself answers void — the same
// reasoning discard.routes.ts's own header already states for its own write
// with nothing left to describe. This is this task's own inference,
// disclosed in its delivery record.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handlePlaceHypothesisRequest, type PlaceHypothesisControllerDependencies } from './place-hypothesis.controller.js';
import { placeHypothesisBodySchema, placeHypothesisParamsSchema } from './dto/place-hypothesis.dto.js';

/** A versioned prefix (API-06), matching diagnose.routes.ts's, read-case.routes.ts's, update-draft.routes.ts's, release.routes.ts's and discard.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the place-hypothesis route as a Fastify plugin closed over the
 * given dependencies — a narrowed slice of the published case-lifecycle
 * operations, just the placeHypothesis function — so the plugin body itself
 * constructs nothing (ARC-02).
 */
export function createPlaceHypothesisRoutesPlugin(dependencies: PlaceHypothesisControllerDependencies): FastifyPluginAsync {
  return async function placeHypothesisRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.put(`${API_PREFIX}/cases/:slug/versions/:version/manifest/:hypothesis_name`, (request, reply) =>
      placeHypothesisHandler(dependencies, request, reply),
    );
  };
}

/**
 * Validates both path parameters and the request body before the controller
 * is reached (DTO-01, EDG-01): a :slug, :version or :hypothesis_name failing
 * placeHypothesisParamsSchema — including a non-numeric :version — or a body
 * failing placeHypothesisBodySchema answers 400 with the validation
 * envelope, naming every violated field; otherwise the controller runs to
 * completion and the route answers 204 with no body, and a thrown
 * CaseNotFoundError, CaseVersionNotDraftError or ManifestPositionOccupiedError
 * is left to reach the app's shared error handler.
 */
async function placeHypothesisHandler(
  dependencies: PlaceHypothesisControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = placeHypothesisParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedBody = placeHypothesisBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  await handlePlaceHypothesisRequest(dependencies, parsedParams.data, parsedBody.data);
  return reply.code(204).send();
}
