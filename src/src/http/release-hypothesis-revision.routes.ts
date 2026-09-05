import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReleaseHypothesisRevisionRequest,
  type ReleaseHypothesisRevisionControllerDependencies,
} from './release-hypothesis-revision.controller.js';
import { releaseHypothesisRevisionParamsSchema } from './dto/release-hypothesis-revision.dto.js';

const API_PREFIX = '/v1';

export function createReleaseHypothesisRevisionRoutesPlugin(
  dependencies: ReleaseHypothesisRevisionControllerDependencies,
): FastifyPluginAsync {
  return async function releaseHypothesisRevisionRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/cases/:slug/hypotheses/:name/revisions/:revision/release`, (request, reply) =>
      releaseHypothesisRevisionHandler(dependencies, request, reply),
    );
  };
}

async function releaseHypothesisRevisionHandler(
  dependencies: ReleaseHypothesisRevisionControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = releaseHypothesisRevisionParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  await handleReleaseHypothesisRevisionRequest(dependencies, parsedParams.data);
  return reply.code(204).send();
}
