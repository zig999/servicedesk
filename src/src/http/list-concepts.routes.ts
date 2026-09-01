import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleListConceptsRequest, type ListConceptsControllerDependencies } from './list-concepts.controller.js';
import { listConceptsQuerySchema } from './dto/list-concepts.dto.js';

const API_PREFIX = '/v1';

export function createListConceptsRoutesPlugin(dependencies: ListConceptsControllerDependencies): FastifyPluginAsync {
  return async function listConceptsRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/glossary/concepts`, (request, reply) => listConceptsHandler(dependencies, request, reply));
  };
}

async function listConceptsHandler(
  dependencies: ListConceptsControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = listConceptsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request query failed validation', details: issues } });
  }
  const page = await handleListConceptsRequest(dependencies, parsed.data);
  return reply.code(200).send(page);
}
