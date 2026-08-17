// Registers PATCH /v1/cases/{slug}/versions/{version}
// (task/case-lifecycle-http/update-draft-route, contracts/knowledge/case-lifecycle):
// validates the two path parameters against updateDraftParamsSchema and the
// request body against updateDraftBodySchema before the controller is ever
// reached (DTO-01, EDG-01), then hands both parsed DTOs straight to
// handleUpdateDraftRequest and answers with whatever it resolves. The route
// sits under the same versioned prefix diagnose.routes.ts and
// read-case.routes.ts already establish (API-06), and this module
// constructs none of its own dependencies (ARC-02) — they arrive as this
// plugin's own closure, built once by whichever factory eventually wires
// this route into the running app
// (task/case-lifecycle-http/register-routes-in-build-app, not this task's
// own concern). A domain refusal the controller leaves to propagate
// (CaseNotFoundError, CaseVersionNotDraftError) sets no error handler of its
// own here: this plugin answers through whichever one the app already has
// registered (COR-04, error-handler.middleware.ts), exactly as
// read-case.routes.ts already leaves every propagated error to it.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleUpdateDraftRequest, type UpdateDraftControllerDependencies } from './update-draft.controller.js';
import { updateDraftBodySchema, updateDraftParamsSchema } from './dto/update-draft.dto.js';

/** A versioned prefix (API-06), matching diagnose.routes.ts's and read-case.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the update-draft route as a Fastify plugin closed over the given
 * dependencies — the published case-lifecycle write plus the published
 * knowledge-context read — so the plugin body itself constructs nothing
 * (ARC-02).
 */
export function createUpdateDraftRoutesPlugin(dependencies: UpdateDraftControllerDependencies): FastifyPluginAsync {
  return async function updateDraftRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.patch(`${API_PREFIX}/cases/:slug/versions/:version`, (request, reply) => updateDraftHandler(dependencies, request, reply));
  };
}

/**
 * Validates both path parameters and the request body before the
 * controller is reached (DTO-01, EDG-01): a :slug or :version failing
 * updateDraftParamsSchema — including a non-numeric :version — or a body
 * failing updateDraftBodySchema answers 400 with the validation envelope,
 * naming every violated field; otherwise the controller's own updated
 * version answers 200, unchanged, and a thrown CaseNotFoundError or
 * CaseVersionNotDraftError is left to reach the app's shared error handler.
 */
async function updateDraftHandler(
  dependencies: UpdateDraftControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = updateDraftParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedBody = updateDraftBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const updatedVersion = await handleUpdateDraftRequest(dependencies, parsedParams.data, parsedBody.data);
  return reply.code(200).send(updatedVersion);
}
