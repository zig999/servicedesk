import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleReadCaseRequest, type ReadCaseControllerDependencies } from './read-case.controller.js';
import { readCaseParamsSchema } from './dto/read-case.dto.js';

const API_PREFIX = '/v1';

export function createReadCaseRoutesPlugin(dependencies: ReadCaseControllerDependencies): FastifyPluginAsync {
  return async function readCaseRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/cases/:slug/versions/:version`, (request, reply) => readCaseHandler(dependencies, request, reply));
  };
}

async function readCaseHandler(
  dependencies: ReadCaseControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = readCaseParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const caseVersion = await handleReadCaseRequest(dependencies, parsed.data);
  return reply.code(200).send(caseVersion);
}
