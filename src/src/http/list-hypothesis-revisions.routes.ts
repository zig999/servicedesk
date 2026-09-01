import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleListHypothesisRevisionsRequest,
  type ListHypothesisRevisionsControllerDependencies,
} from './list-hypothesis-revisions.controller.js';
import {
  listHypothesisRevisionsParamsSchema,
  listHypothesisRevisionsQuerySchema,
} from './dto/list-hypothesis-revisions.dto.js';

const API_PREFIX = '/v1';

export function createListHypothesisRevisionsRoutesPlugin(
  dependencies: ListHypothesisRevisionsControllerDependencies,
): FastifyPluginAsync {
  return async function listHypothesisRevisionsRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/cases/:slug/hypotheses/:name/revisions`, (request, reply) =>
      listHypothesisRevisionsHandler(dependencies, request, reply),
    );
  };
}

async function listHypothesisRevisionsHandler(
  dependencies: ListHypothesisRevisionsControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = listHypothesisRevisionsParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedQuery = listHypothesisRevisionsQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    const issues = parsedQuery.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request query failed validation', details: issues } });
  }
  const page = await handleListHypothesisRevisionsRequest(dependencies, parsedParams.data, parsedQuery.data);
  return reply.code(200).send(page);
}
