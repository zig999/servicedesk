import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReadCaseVersionRequest,
  type ReadCaseVersionControllerDependencies,
} from './read-case-version.controller.js';
import { readCaseVersionParamsSchema } from './dto/read-case-version.dto.js';

const API_PREFIX = '/v1';

export function createReadCaseVersionRoutesPlugin(
  dependencies: ReadCaseVersionControllerDependencies,
): FastifyPluginAsync {
  return async function readCaseVersionRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/cases/:slug/versions/:version/declared-attributes`, (request, reply) =>
      readCaseVersionHandler(dependencies, request, reply),
    );
  };
}

async function readCaseVersionHandler(
  dependencies: ReadCaseVersionControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = readCaseVersionParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const attributes = await handleReadCaseVersionRequest(dependencies, parsed.data);
  return reply.code(200).send(attributes);
}
