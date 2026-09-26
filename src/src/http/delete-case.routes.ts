import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleDeleteCaseRequest, type DeleteCaseControllerDependencies } from './delete-case.controller.js';
import { deleteCaseParamsSchema } from './dto/delete-case.dto.js';

const API_PREFIX = '/v1';

export function createDeleteCaseRoutesPlugin(dependencies: DeleteCaseControllerDependencies): FastifyPluginAsync {
  return async function deleteCaseRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.delete(`${API_PREFIX}/cases/:slug`, (request, reply) => deleteCaseHandler(dependencies, request, reply));
  };
}

async function deleteCaseHandler(
  dependencies: DeleteCaseControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = deleteCaseParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  await handleDeleteCaseRequest(dependencies, parsedParams.data);
  return reply.code(204).send();
}
