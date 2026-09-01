import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleListHypothesesRequest, type ListHypothesesControllerDependencies } from './list-hypotheses.controller.js';
import { listHypothesesParamsSchema, listHypothesesQuerySchema } from './dto/list-hypotheses.dto.js';

const API_PREFIX = '/v1';

export function createListHypothesesRoutesPlugin(
  dependencies: ListHypothesesControllerDependencies,
): FastifyPluginAsync {
  return async function listHypothesesRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/cases/:slug/hypotheses`, (request, reply) => listHypothesesHandler(dependencies, request, reply));
  };
}

async function listHypothesesHandler(
  dependencies: ListHypothesesControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = listHypothesesParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedQuery = listHypothesesQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    const issues = parsedQuery.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request query failed validation', details: issues } });
  }
  const page = await handleListHypothesesRequest(dependencies, parsedParams.data.slug, parsedQuery.data);
  return reply.code(200).send(page);
}
