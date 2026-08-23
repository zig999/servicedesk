// Registers PUT /v1/capabilities/{name}/{version}
// (task/capability-authoring/register-capability-route,
// contracts/integration/capability-registry): validates the two path
// parameters against registerCapabilityParamsSchema and the request body
// against registerCapabilityBodySchema before the controller is ever reached
// (DTO-01, EDG-01), then hands both parsed DTOs straight to
// handleRegisterCapabilityRequest and answers 200 with the held capability's
// whole declared contract. The route sits under the same versioned prefix
// every sibling route already establishes (API-06), and this module
// constructs none of its own dependencies (ARC-02) — they arrive as this
// plugin's own closure, built once by build-app.factory.ts's own
// composeResources. A domain refusal the controller leaves to propagate
// (IncompleteCapabilityContractError, CapabilitySchemaNotWellFormedError,
// CapabilityNotReadOnlyError, ConceptAlreadyAnsweredError) sets no error
// handler of its own here: this plugin answers through whichever one the app
// already has registered (COR-04, error-handler.middleware.ts), exactly as
// place-hypothesis.routes.ts already leaves every propagated error to it.
// This route declares no authentication guard of its own, consistent with
// constraints/no-route-enforces-authentication — a request carrying no
// credential is dispatched exactly like one that carries one.
//
// PUT rather than POST (this task's own inference, disclosed in its
// delivery record): the operation creates a capability at a new (name,
// version) or replaces one already held there in place — the same
// create-or-replace-at-a-known-identity semantics place-hypothesis.routes.ts
// already answers with PUT — and, unlike create-draft.routes.ts's own POST,
// the capability's own identity is known before the call rather than
// assigned by it, so it is carried in the path rather than the body,
// mirroring place-hypothesis.routes.ts's own "identity in path, never
// duplicated into the body" convention. Answers 200 rather than
// place-hypothesis.routes.ts's own 204: this task's own criterion 1 asks for
// a response that reflects the registered contract, so a body is always
// returned, and capability-registry.service.ts's own registerCapability
// never distinguishes a creation from a replacement — it holds either the
// same way, through one write — so this route answers the same status for
// both rather than a distinction this task's own criteria never ask it to
// draw.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleRegisterCapabilityRequest,
  type RegisterCapabilityControllerDependencies,
} from './register-capability.controller.js';
import { registerCapabilityBodySchema, registerCapabilityParamsSchema } from './dto/register-capability.dto.js';

/** A versioned prefix (API-06), matching every sibling route's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the register-capability route as a Fastify plugin closed over the
 * given dependencies — the registerCapability operation alone — so the
 * plugin body itself constructs nothing (ARC-02).
 */
export function createRegisterCapabilityRoutesPlugin(
  dependencies: RegisterCapabilityControllerDependencies,
): FastifyPluginAsync {
  return async function registerCapabilityRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.put(`${API_PREFIX}/capabilities/:name/:version`, (request, reply) =>
      registerCapabilityHandler(dependencies, request, reply),
    );
  };
}

/**
 * Validates both path parameters and the request body before the controller
 * is reached (DTO-01, EDG-01): a :name or :version, or a body, failing its
 * own schema answers 400 with the validation envelope, naming every
 * violated field; otherwise the controller's own held capability answers
 * 200, unchanged, and a thrown domain refusal is left to reach the app's
 * shared error handler.
 */
async function registerCapabilityHandler(
  dependencies: RegisterCapabilityControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = registerCapabilityParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedBody = registerCapabilityBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const capability = await handleRegisterCapabilityRequest(dependencies, parsedParams.data, parsedBody.data);
  return reply.code(200).send(capability);
}
