import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReadVocabularyTermRequest,
  type ReadVocabularyTermControllerDependencies,
} from './read-vocabulary-term.controller.js';
import { readVocabularyTermParamsSchema } from './dto/read-vocabulary-term.dto.js';

const API_PREFIX = '/v1';

export function createReadVocabularyTermRoutesPlugin(
  dependencies: ReadVocabularyTermControllerDependencies,
): FastifyPluginAsync {
  return async function readVocabularyTermRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/glossary/:vocabulary/:name`, (request, reply) =>
      readVocabularyTermHandler(dependencies, request, reply),
    );
  };
}

async function readVocabularyTermHandler(
  dependencies: ReadVocabularyTermControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = readVocabularyTermParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const term = await handleReadVocabularyTermRequest(dependencies, parsed.data);
  return reply.code(200).send(term);
}
