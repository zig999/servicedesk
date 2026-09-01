import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleListConnectorConfigurationsRequest,
  type ListConnectorConfigurationsControllerDependencies,
} from './list-connector-configurations.controller.js';
import { listConnectorConfigurationsQuerySchema } from './dto/list-connector-configurations.dto.js';

const API_PREFIX = '/v1';

export function createListConnectorConfigurationsRoutesPlugin(
  dependencies: ListConnectorConfigurationsControllerDependencies,
): FastifyPluginAsync {
  return async function listConnectorConfigurationsRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/connectors`, (request, reply) =>
      listConnectorConfigurationsHandler(dependencies, request, reply),
    );
  };
}

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
