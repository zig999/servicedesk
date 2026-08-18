// Registers POST /v1/cases/{slug}/versions/{version}/release
// (task/case-lifecycle-http/release-route, contracts/knowledge/case-lifecycle):
// validates the two path parameters against releaseParamsSchema before the
// controller is ever reached (DTO-01, EDG-01), then hands the parsed DTO
// straight to handleReleaseRequest and answers with whatever it resolves.
// The route sits under the same versioned prefix diagnose.routes.ts,
// read-case.routes.ts and update-draft.routes.ts already establish (API-06),
// and this module constructs none of its own dependencies (ARC-02) — they
// arrive as this plugin's own closure, built once by whichever factory
// eventually wires this route into the running app
// (task/case-lifecycle-http/register-routes-in-build-app, not this task's
// own concern). release takes no request body, so nothing validates the
// body here, mirroring release.operation.ts's own release(slug, version)
// signature. A domain refusal the controller leaves to propagate
// (CaseVersionNotDraftAtReleaseError, CaseVersionNotReleasableError,
// CaseNotFoundError) sets no error handler of its own here: this plugin
// answers through whichever one the app already has registered (COR-04,
// error-handler.middleware.ts), exactly as update-draft.routes.ts already
// leaves every propagated error to it.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleReleaseRequest, type ReleaseControllerDependencies } from './release.controller.js';
import { releaseParamsSchema } from './dto/release.dto.js';

/** A versioned prefix (API-06), matching diagnose.routes.ts's, read-case.routes.ts's and update-draft.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the release route as a Fastify plugin closed over the given
 * dependencies — the published case-lifecycle release, narrowed to that one
 * function, plus the published knowledge-context read — so the plugin body
 * itself constructs nothing (ARC-02).
 */
export function createReleaseRoutesPlugin(dependencies: ReleaseControllerDependencies): FastifyPluginAsync {
  return async function releaseRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/cases/:slug/versions/:version/release`, (request, reply) =>
      releaseHandler(dependencies, request, reply),
    );
  };
}

/**
 * Validates the path parameters before the controller is reached (DTO-01,
 * EDG-01): a :slug or :version failing releaseParamsSchema — including a
 * non-numeric :version — answers 400 with the validation envelope, naming
 * every violated field; otherwise the controller's own released version
 * answers 200, unchanged, and a thrown CaseVersionNotDraftAtReleaseError,
 * CaseVersionNotReleasableError or CaseNotFoundError is left to reach the
 * app's shared error handler.
 */
async function releaseHandler(
  dependencies: ReleaseControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = releaseParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const releasedVersion = await handleReleaseRequest(dependencies, parsedParams.data);
  return reply.code(200).send(releasedVersion);
}
