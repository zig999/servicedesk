import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleListCaseVersionsRequest, type ListCaseVersionsControllerDependencies } from './list-case-versions.controller.js';
import { listCaseVersionsParamsSchema, listCaseVersionsQuerySchema } from './dto/list-case-versions.dto.js';

const API_PREFIX = '/v1';

export function createListCaseVersionsRoutesPlugin(
  dependencies: ListCaseVersionsControllerDependencies,
): FastifyPluginAsync {
  return async function listCaseVersionsRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/cases/:slug/versions`, (request, reply) => listCaseVersionsHandler(dependencies, request, reply));
  };
}

async function listCaseVersionsHandler(
  dependencies: ListCaseVersionsControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = listCaseVersionsParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedQuery = listCaseVersionsQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    const issues = parsedQuery.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request query failed validation', details: issues } });
  }
  const page = await handleListCaseVersionsRequest(dependencies, parsedParams.data.slug, parsedQuery.data);
  return reply.code(200).send(page);
}
