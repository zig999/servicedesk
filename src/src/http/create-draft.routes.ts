// Registers POST /v1/cases (task/case-lifecycle-http/create-draft-route,
// contracts/knowledge/case-lifecycle): validates the request body against
// createDraftBodySchema before the controller is ever reached (DTO-01,
// EDG-01), then hands the parsed DTO straight to handleCreateDraftRequest
// and answers with whatever it resolves. The route sits under the same
// versioned prefix diagnose.routes.ts, read-case.routes.ts and
// update-draft.routes.ts already establish (API-06), and this module
// constructs none of its own dependencies (ARC-02) — they arrive as this
// plugin's own closure, built once by whichever factory eventually wires
// this route into the running app
// (task/case-lifecycle-http/register-routes-in-build-app, not this task's
// own concern). CaseAlreadyHasDraftError, the one domain refusal the
// controller leaves to propagate, sets no error handler of its own here:
// this plugin answers through whichever one the app already has registered
// (COR-04, error-handler.middleware.ts), exactly as update-draft.routes.ts
// already leaves every propagated error to it. There is no pre-check here
// either — a slug naming an existing case with no open draft still reaches
// the controller and still succeeds, originating that case's own next draft
// (this task's own UNDERDETERMINED note).
//
// Answers 201 Created rather than update-draft.routes.ts's own 200: this is
// the first route in this codebase whose successful call originates a new
// resource (a new draft version) rather than reading one back or correcting
// one already stored in place, so the created-resource status applies here
// where it did not for PATCH's own in-place correction — this task's own
// inference, disclosed in its delivery record.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleCreateDraftRequest, type CreateDraftControllerDependencies } from './create-draft.controller.js';
import { createDraftBodySchema } from './dto/create-draft.dto.js';

/** A versioned prefix (API-06), matching diagnose.routes.ts's, read-case.routes.ts's and update-draft.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the create-draft route as a Fastify plugin closed over the given
 * dependencies — the published case-lifecycle create-draft operation alone —
 * so the plugin body itself constructs nothing (ARC-02).
 */
export function createCreateDraftRoutesPlugin(dependencies: CreateDraftControllerDependencies): FastifyPluginAsync {
  return async function createDraftRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/cases`, (request, reply) => createDraftHandler(dependencies, request, reply));
  };
}

/**
 * Validates the request body before the controller is reached (DTO-01,
 * EDG-01): a body failing createDraftBodySchema answers 400 with the
 * validation envelope, naming every violated field; otherwise the
 * controller's own CreatedDraft answers 201, unchanged, and a thrown
 * CaseAlreadyHasDraftError is left to reach the app's shared error handler.
 */
async function createDraftHandler(
  dependencies: CreateDraftControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedBody = createDraftBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const createdDraft = await handleCreateDraftRequest(dependencies, parsedBody.data);
  return reply.code(201).send(createdDraft);
}
