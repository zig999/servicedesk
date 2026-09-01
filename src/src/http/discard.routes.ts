import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleDiscardRequest, type DiscardControllerDependencies } from './discard.controller.js';
import { discardParamsSchema } from './dto/discard.dto.js';

const API_PREFIX = '/v1';

export function createDiscardRoutesPlugin(dependencies: DiscardControllerDependencies): FastifyPluginAsync {
  return async function discardRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.delete(`${API_PREFIX}/cases/:slug/versions/:version`, (request, reply) => discardHandler(dependencies, request, reply));
  };
}

async function discardHandler(
  dependencies: DiscardControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = discardParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  await handleDiscardRequest(dependencies, parsedParams.data);
  return reply.code(204).send();
}
