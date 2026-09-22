import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleRemoveConceptRequest, type RemoveConceptControllerDependencies } from './remove-concept.controller.js';
import { removeConceptParamsSchema } from './dto/remove-concept.dto.js';

const API_PREFIX = '/v1';

export function createRemoveConceptRoutesPlugin(dependencies: RemoveConceptControllerDependencies): FastifyPluginAsync {
  return async function removeConceptRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.delete(`${API_PREFIX}/glossary/concepts/:name`, (request, reply) =>
      removeConceptHandler(dependencies, request, reply),
    );
  };
}

async function removeConceptHandler(
  dependencies: RemoveConceptControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = removeConceptParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  await handleRemoveConceptRequest(dependencies, parsedParams.data);
  return reply.code(204).send();
}
