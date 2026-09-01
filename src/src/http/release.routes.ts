import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleReleaseRequest, type ReleaseControllerDependencies } from './release.controller.js';
import { releaseParamsSchema } from './dto/release.dto.js';

const API_PREFIX = '/v1';

export function createReleaseRoutesPlugin(dependencies: ReleaseControllerDependencies): FastifyPluginAsync {
  return async function releaseRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/cases/:slug/versions/:version/release`, (request, reply) =>
      releaseHandler(dependencies, request, reply),
    );
  };
}

async function releaseHandler(
  dependencies: ReleaseControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = releaseParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const releasedVersion = await handleReleaseRequest(dependencies, parsedParams.data);
  return reply.code(200).send(releasedVersion);
}
