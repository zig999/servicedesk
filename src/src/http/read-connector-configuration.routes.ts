import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReadConnectorConfigurationRequest,
  type ReadConnectorConfigurationControllerDependencies,
} from './read-connector-configuration.controller.js';
import { readConnectorConfigurationParamsSchema } from './dto/read-connector-configuration.dto.js';

const API_PREFIX = '/v1';

export function createReadConnectorConfigurationRoutesPlugin(
  dependencies: ReadConnectorConfigurationControllerDependencies,
): FastifyPluginAsync {
  return async function readConnectorConfigurationRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/connectors/:connector`, (request, reply) =>
      readConnectorConfigurationHandler(dependencies, request, reply),
    );
  };
}

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
