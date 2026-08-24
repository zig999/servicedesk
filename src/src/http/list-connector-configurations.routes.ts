// Registers GET /v1/connectors
// (task/connector-configuration-authoring/list-connector-configurations-route,
// contracts/integration/connector-configuration-registry): validates the
// query string against listConnectorConfigurationsQuerySchema before the
// controller is ever reached (DTO-01, EDG-01), then hands the parsed DTO
// straight to handleListConnectorConfigurationsRequest and answers with
// whatever page it resolves. The route sits under the same versioned prefix
// every sibling route already establishes (API-06), at the connectors
// collection path read-connector-configuration.routes.ts and
// register-connector.routes.ts both address one member of
// (/v1/connectors/:connector), and this module constructs none of its own
// dependencies (ARC-02) — they arrive as this plugin's own closure, built
// once by build-app.factory.ts's own composeResources, reusing the same
// ConnectorConfigurationRegistryService instance registerConnector and
// readConnectorConfiguration already share. listConnectorConfigurations
// raises no domain error of its own
// (list-connector-configurations.controller.ts's own header comment), so
// this plugin sets no error handler of its own here either — it answers
// through whichever one the app already has registered (COR-04,
// error-handler.middleware.ts), exactly as list-capabilities.routes.ts
// already leaves every propagated error to it. This route declares no
// authentication guard of its own, consistent with
// constraints/no-route-enforces-authentication — a request carrying no
// credential is dispatched exactly like one that carries one.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleListConnectorConfigurationsRequest,
  type ListConnectorConfigurationsControllerDependencies,
} from './list-connector-configurations.controller.js';
import { listConnectorConfigurationsQuerySchema } from './dto/list-connector-configurations.dto.js';

/** A versioned prefix (API-06), matching every sibling route's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the list-connector-configurations route as a Fastify plugin closed
 * over the given dependencies — the published connector-configuration
 * registry read plus the configured pagination bound — so the plugin body
 * itself constructs nothing (ARC-02).
 */
export function createListConnectorConfigurationsRoutesPlugin(
  dependencies: ListConnectorConfigurationsControllerDependencies,
): FastifyPluginAsync {
  return async function listConnectorConfigurationsRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/connectors`, (request, reply) =>
      listConnectorConfigurationsHandler(dependencies, request, reply),
    );
  };
}

/**
 * Validates the query string before the controller is reached (DTO-01,
 * EDG-01): an offset or limit present but failing
 * listConnectorConfigurationsQuerySchema — negative, non-numeric or
 * otherwise malformed — answers 400 with the validation envelope, naming
 * every violated field; otherwise the controller's own resolved page
 * answers 200, unchanged.
 */
async function listConnectorConfigurationsHandler(
  dependencies: ListConnectorConfigurationsControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = listConnectorConfigurationsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request query failed validation', details: issues } });
  }
  const page = await handleListConnectorConfigurationsRequest(dependencies, parsed.data);
  return reply.code(200).send(page);
}
