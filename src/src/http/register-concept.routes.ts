// Registers PUT /v1/glossary/concepts/{name}
// (task/concept-authoring/register-concept-route,
// contracts/glossary/glossary-authoring): validates the path parameter
// against registerConceptParamsSchema and the request body against
// registerConceptBodySchema before the controller is ever reached (DTO-01,
// EDG-01), then hands both parsed DTOs straight to
// handleRegisterConceptRequest and answers 200 with the registered concept.
// The route sits under the same versioned prefix every sibling route already
// establishes (API-06), spelled under /glossary/concepts the same way
// read-concept.routes.ts's own path is, and this module constructs none of
// its own dependencies (ARC-02) — they arrive as this plugin's own closure,
// built once by build-app.factory.ts's own composeResources. This route
// declares no authentication guard of its own, consistent with
// constraints/no-route-enforces-authentication — a request carrying no
// credential is dispatched exactly like one that carries one.
//
// PUT rather than POST (mirroring register-capability.routes.ts's own
// inference, disclosed there and reused here for the same reason): the
// operation creates a concept at a new name or replaces one already held
// there in place (domain/glossary/concept) — the same
// create-or-replace-at-a-known-identity semantics register-capability.routes.ts
// already answers with PUT — and the concept's own identity (its name) is
// known before the call rather than assigned by it, so it is carried in the
// path rather than the body, mirroring register-capability.routes.ts's own
// "identity in path, never duplicated into the body" convention. Answers 200
// rather than a distinction between creation and replacement:
// GlossaryService.registerConcept never distinguishes the two — it holds
// either the same way, through one write — so this route answers the same
// status for both rather than a distinction this task's own criteria never
// ask it to draw.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleRegisterConceptRequest,
  type RegisterConceptControllerDependencies,
} from './register-concept.controller.js';
import { registerConceptBodySchema, registerConceptParamsSchema } from './dto/register-concept.dto.js';

/** A versioned prefix (API-06), matching every sibling route's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the register-concept route as a Fastify plugin closed over the
 * given dependencies — the registerConcept operation alone — so the plugin
 * body itself constructs nothing (ARC-02).
 */
export function createRegisterConceptRoutesPlugin(
  dependencies: RegisterConceptControllerDependencies,
): FastifyPluginAsync {
  return async function registerConceptRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.put(`${API_PREFIX}/glossary/concepts/:name`, (request, reply) =>
      registerConceptHandler(dependencies, request, reply),
    );
  };
}

/**
 * Validates both the path parameter and the request body before the
 * controller is reached (DTO-01, EDG-01): a :name or a body failing its own
 * schema answers 400 with the validation envelope, naming every violated
 * field; otherwise the controller's own registered concept answers 200.
 */
async function registerConceptHandler(
  dependencies: RegisterConceptControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = registerConceptParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedBody = registerConceptBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const concept = await handleRegisterConceptRequest(dependencies, parsedParams.data, parsedBody.data);
  return reply.code(200).send(concept);
}
