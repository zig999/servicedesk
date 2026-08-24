// Registers GET /v1/connectors/{connector}
// (task/connector-configuration-authoring/read-connector-configuration-route,
// contracts/integration/connector-configuration-registry): validates the
// path parameter against readConnectorConfigurationParamsSchema before the
// controller is ever reached (DTO-01, EDG-01), then hands the parsed DTO
// straight to handleReadConnectorConfigurationRequest and answers with
// whatever it resolves. The route sits under the same versioned prefix
// every sibling route already establishes (API-06), at the same path
// register-connector.routes.ts already registers its own PUT against, and
// this module constructs none of its own dependencies (ARC-02) — they
// arrive as this plugin's own closure, built once by build-app.factory.ts's
// own composeResources, reusing the same ConnectorConfigurationRegistryService
// instance registerConnector already shares. A domain refusal the controller
// raises (ConnectorConfigurationNotFoundError) is left to propagate: this
// plugin sets no error handler of its own, so it answers through whichever
// one the app already has registered (COR-04, error-handler.middleware.ts),
// exactly as read-capability.routes.ts leaves every propagated error to it
// today. This route declares no authentication guard of its own, consistent
// with constraints/no-route-enforces-authentication — a request carrying no
// credential is dispatched exactly like one that carries one.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReadConnectorConfigurationRequest,
  type ReadConnectorConfigurationControllerDependencies,
} from './read-connector-configuration.controller.js';
import { readConnectorConfigurationParamsSchema } from './dto/read-connector-configuration.dto.js';

/** A versioned prefix (API-06), matching every sibling route's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the read-connector-configuration route as a Fastify plugin closed
 * over the given dependencies — the published connector-configuration-registry
 * read — so the plugin body itself constructs nothing (ARC-02).
 */
export function createReadConnectorConfigurationRoutesPlugin(
  dependencies: ReadConnectorConfigurationControllerDependencies,
): FastifyPluginAsync {
  return async function readConnectorConfigurationRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/connectors/:connector`, (request, reply) =>
      readConnectorConfigurationHandler(dependencies, request, reply),
    );
  };
}

/**
 * Validates the path parameter before the controller is reached (DTO-01,
 * EDG-01): a request whose :connector segment fails
 * readConnectorConfigurationParamsSchema answers 400 with the validation
 * envelope, naming every violated field; otherwise the controller's own
 * resolved connector configuration answers 200, unchanged, and a thrown
 * ConnectorConfigurationNotFoundError is left to reach the app's shared
 * error handler.
 */
async function readConnectorConfigurationHandler(
  dependencies: ReadConnectorConfigurationControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = readConnectorConfigurationParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const configuration = await handleReadConnectorConfigurationRequest(dependencies, parsed.data);
  return reply.code(200).send(configuration);
}
