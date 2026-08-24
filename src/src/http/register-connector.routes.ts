// Registers PUT /v1/connectors/{connector}
// (task/connector-configuration-authoring/register-connector-route,
// contracts/integration/connector-configuration-registry): validates the
// path parameter against registerConnectorParamsSchema and the request body
// against registerConnectorBodySchema before the controller is ever reached
// (DTO-01, EDG-01), then hands both parsed DTOs straight to
// handleRegisterConnectorRequest and answers 200 with the held connector
// configuration's whole registered shape. The route sits under the same
// versioned prefix every sibling route already establishes (API-06), and
// this module constructs none of its own dependencies (ARC-02) — they
// arrive as this plugin's own closure, built once by build-app.factory.ts's
// own composeResources. A domain refusal the controller leaves to propagate
// (IncompleteConnectorConfigurationError, ConnectorConfigurationNotWellFormedError)
// sets no error handler of its own here: this plugin answers through
// whichever one the app already has registered (COR-04,
// error-handler.middleware.ts), exactly as register-capability.routes.ts
// already leaves every propagated error to it. This route declares no
// authentication guard of its own, consistent with
// constraints/no-route-enforces-authentication — a request carrying no
// credential is dispatched exactly like one that carries one.
//
// PUT rather than POST (mirroring register-capability.routes.ts's own
// inference, disclosed there and reused here for the same reason): the
// operation creates a connector configuration at a new connector name or
// replaces one already held there in place
// (domain/integration/connector-configuration) — the same
// create-or-replace-at-a-known-identity semantics register-capability.routes.ts
// already answers with PUT — and the connector's own identity is known
// before the call rather than assigned by it, so it is carried in the path
// rather than the body, mirroring register-capability.routes.ts's own
// "identity in path, never duplicated into the body" convention. Answers 200
// rather than a distinction between creation and replacement:
// ConnectorConfigurationRegistryService.registerConnector never distinguishes
// the two — it holds either the same way, through one write — so this route
// answers the same status for both rather than a distinction this task's own
// criteria never ask it to draw.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleRegisterConnectorRequest,
  type RegisterConnectorControllerDependencies,
} from './register-connector.controller.js';
import { registerConnectorBodySchema, registerConnectorParamsSchema } from './dto/register-connector.dto.js';

/** A versioned prefix (API-06), matching every sibling route's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the register-connector route as a Fastify plugin closed over the
 * given dependencies — the registerConnector operation alone — so the
 * plugin body itself constructs nothing (ARC-02).
 */
export function createRegisterConnectorRoutesPlugin(
  dependencies: RegisterConnectorControllerDependencies,
): FastifyPluginAsync {
  return async function registerConnectorRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.put(`${API_PREFIX}/connectors/:connector`, (request, reply) =>
      registerConnectorHandler(dependencies, request, reply),
    );
  };
}

/**
 * Validates both the path parameter and the request body before the
 * controller is reached (DTO-01, EDG-01): a :connector or a body failing
 * its own schema answers 400 with the validation envelope, naming every
 * violated field; otherwise the controller's own registered connector
 * configuration answers 200, and a thrown domain refusal is left to reach
 * the app's shared error handler.
 */
async function registerConnectorHandler(
  dependencies: RegisterConnectorControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = registerConnectorParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedBody = registerConnectorBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const configuration = await handleRegisterConnectorRequest(dependencies, parsedParams.data, parsedBody.data);
  return reply.code(200).send(configuration);
}
