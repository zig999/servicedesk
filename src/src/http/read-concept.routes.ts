import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReadConceptRequest,
  type ReadConceptControllerDependencies,
} from './read-concept.controller.js';
import { readConceptParamsSchema } from './dto/read-concept.dto.js';

const API_PREFIX = '/v1';

export function createReadConceptRoutesPlugin(
  dependencies: ReadConceptControllerDependencies,
): FastifyPluginAsync {
  return async function readConceptRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/glossary/concepts/:name`, (request, reply) => readConceptHandler(dependencies, request, reply));
  };
}

async function readConceptHandler(
  dependencies: ReadConceptControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = readConceptParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const concept = await handleReadConceptRequest(dependencies, parsed.data);
  return reply.code(200).send(concept);
}
