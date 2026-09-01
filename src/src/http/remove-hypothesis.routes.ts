import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleRemoveHypothesisRequest, type RemoveHypothesisControllerDependencies } from './remove-hypothesis.controller.js';
import { removeHypothesisParamsSchema } from './dto/remove-hypothesis.dto.js';

const API_PREFIX = '/v1';

export function createRemoveHypothesisRoutesPlugin(dependencies: RemoveHypothesisControllerDependencies): FastifyPluginAsync {
  return async function removeHypothesisRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.delete(`${API_PREFIX}/cases/:slug/versions/:version/manifest/:hypothesis_name`, (request, reply) =>
      removeHypothesisHandler(dependencies, request, reply),
    );
  };
}

async function removeHypothesisHandler(
  dependencies: RemoveHypothesisControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = removeHypothesisParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  await handleRemoveHypothesisRequest(dependencies, parsedParams.data);
  return reply.code(204).send();
}
