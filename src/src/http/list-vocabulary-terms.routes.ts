import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleListVocabularyTermsRequest,
  type ListVocabularyTermsControllerDependencies,
} from './list-vocabulary-terms.controller.js';
import { listVocabularyTermsParamsSchema, listVocabularyTermsQuerySchema } from './dto/list-vocabulary-terms.dto.js';

const API_PREFIX = '/v1';

export function createListVocabularyTermsRoutesPlugin(
  dependencies: ListVocabularyTermsControllerDependencies,
): FastifyPluginAsync {
  return async function listVocabularyTermsRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/glossary/:vocabulary`, (request, reply) =>
      listVocabularyTermsHandler(dependencies, request, reply),
    );
  };
}

async function listVocabularyTermsHandler(
  dependencies: ListVocabularyTermsControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = listVocabularyTermsParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedQuery = listVocabularyTermsQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    const issues = parsedQuery.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request query failed validation', details: issues } });
  }
  const page = await handleListVocabularyTermsRequest(dependencies, parsedParams.data, parsedQuery.data);
  return reply.code(200).send(page);
}
