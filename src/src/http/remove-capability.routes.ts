import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleRemoveCapabilityRequest, type RemoveCapabilityControllerDependencies } from './remove-capability.controller.js';
import { removeCapabilityParamsSchema } from './dto/remove-capability.dto.js';

const API_PREFIX = '/v1';

export function createRemoveCapabilityRoutesPlugin(dependencies: RemoveCapabilityControllerDependencies): FastifyPluginAsync {
  return async function removeCapabilityRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.delete(`${API_PREFIX}/capabilities/:name/:version`, (request, reply) =>
      removeCapabilityHandler(dependencies, request, reply),
    );
  };
}

async function removeCapabilityHandler(
  dependencies: RemoveCapabilityControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = removeCapabilityParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  await handleRemoveCapabilityRequest(dependencies, parsedParams.data);
  return reply.code(204).send();
}
