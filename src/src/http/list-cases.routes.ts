import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleListCasesRequest, type ListCasesControllerDependencies } from './list-cases.controller.js';
import { listCasesQuerySchema } from './dto/list-cases.dto.js';

const API_PREFIX = '/v1';

export function createListCasesRoutesPlugin(dependencies: ListCasesControllerDependencies): FastifyPluginAsync {
  return async function listCasesRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/cases`, (request, reply) => listCasesHandler(dependencies, request, reply));
  };
}

async function listCasesHandler(
  dependencies: ListCasesControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = listCasesQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request query failed validation', details: issues } });
  }
  const page = await handleListCasesRequest(dependencies, parsed.data);
  return reply.code(200).send(page);
}
