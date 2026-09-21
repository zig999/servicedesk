import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleRemoveConnectorRequest, type RemoveConnectorControllerDependencies } from './remove-connector.controller.js';
import { removeConnectorParamsSchema } from './dto/remove-connector.dto.js';

const API_PREFIX = '/v1';

export function createRemoveConnectorRoutesPlugin(dependencies: RemoveConnectorControllerDependencies): FastifyPluginAsync {
  return async function removeConnectorRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.delete(`${API_PREFIX}/connectors/:connector`, (request, reply) =>
      removeConnectorHandler(dependencies, request, reply),
    );
  };
}

async function removeConnectorHandler(
  dependencies: RemoveConnectorControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = removeConnectorParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  await handleRemoveConnectorRequest(dependencies, parsedParams.data);
  return reply.code(204).send();
}
