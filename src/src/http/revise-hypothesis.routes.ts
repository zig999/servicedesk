// Registers POST /v1/cases/{slug}/hypotheses
// (task/case-lifecycle-http/revise-hypothesis-route, contracts/knowledge/case-lifecycle):
// validates the one path parameter against reviseHypothesisParamsSchema and
// the request body against reviseHypothesisBodySchema before the controller
// is ever reached (DTO-01, EDG-01), then hands both parsed DTOs straight to
// handleReviseHypothesisRequest and answers with whatever it resolves. The
// route sits under the same versioned prefix diagnose.routes.ts,
// read-case.routes.ts, update-draft.routes.ts, create-draft.routes.ts and
// release.routes.ts already establish (API-06), and this module constructs
// none of its own dependencies (ARC-02) — they arrive as this plugin's own
// closure, built once by whichever factory eventually wires this route into
// the running app (task/case-lifecycle-http/register-routes-in-build-app,
// not this task's own concern). A domain refusal the controller leaves to
// propagate (CaseHoldsNoDraftError, HypothesisRevisionCollectsNoConceptError,
// ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError) sets no error
// handler of its own here: this plugin answers through whichever one the app
// already has registered (COR-04, error-handler.middleware.ts), exactly as
// create-draft.routes.ts already leaves every propagated error to it.
//
// Answers 201 Created rather than update-draft.routes.ts's and
// release.routes.ts's own 200: a valid request always originates a new
// hypothesis-revision row (this task's own criterion 1 — "persists a new
// hypothesis-revision"), whether or not it is the hypothesis's own first
// revision, so the created-resource status create-draft.routes.ts's own
// header comment already argues for applies here the same way — this task's
// own inference, disclosed in its delivery record.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleReviseHypothesisRequest, type ReviseHypothesisControllerDependencies } from './revise-hypothesis.controller.js';
import { reviseHypothesisBodySchema, reviseHypothesisParamsSchema } from './dto/revise-hypothesis.dto.js';

/** A versioned prefix (API-06), matching diagnose.routes.ts's, read-case.routes.ts's, update-draft.routes.ts's, create-draft.routes.ts's and release.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the revise-hypothesis route as a Fastify plugin closed over the
 * given dependencies — the published case-lifecycle revise-hypothesis
 * operation alone — so the plugin body itself constructs nothing (ARC-02).
 */
export function createReviseHypothesisRoutesPlugin(dependencies: ReviseHypothesisControllerDependencies): FastifyPluginAsync {
  return async function reviseHypothesisRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/cases/:slug/hypotheses`, (request, reply) => reviseHypothesisHandler(dependencies, request, reply));
  };
}

/**
 * Validates both the path parameter and the request body before the
 * controller is reached (DTO-01, EDG-01): a :slug failing
 * reviseHypothesisParamsSchema or a body failing reviseHypothesisBodySchema
 * answers 400 with the validation envelope, naming every violated field;
 * otherwise the controller's own RevisedHypothesis answers 201, unchanged,
 * and a thrown CaseHoldsNoDraftError, HypothesisRevisionCollectsNoConceptError,
 * ConceptNotInGlossaryError or ConceptRefusesSubjectTypeError is left to
 * reach the app's shared error handler.
 */
async function reviseHypothesisHandler(
  dependencies: ReviseHypothesisControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = reviseHypothesisParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedBody = reviseHypothesisBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const revisedHypothesis = await handleReviseHypothesisRequest(dependencies, parsedParams.data, parsedBody.data);
  return reply.code(201).send(revisedHypothesis);
}
