import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handlePlaceHypothesisRequest, type PlaceHypothesisControllerDependencies } from './place-hypothesis.controller.js';
import { placeHypothesisBodySchema, placeHypothesisParamsSchema } from './dto/place-hypothesis.dto.js';

const API_PREFIX = '/v1';

export function createPlaceHypothesisRoutesPlugin(dependencies: PlaceHypothesisControllerDependencies): FastifyPluginAsync {
  return async function placeHypothesisRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.put(`${API_PREFIX}/cases/:slug/versions/:version/manifest/:hypothesis_name`, (request, reply) =>
      placeHypothesisHandler(dependencies, request, reply),
    );
  };
}

async function placeHypothesisHandler(
  dependencies: PlaceHypothesisControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = placeHypothesisParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedBody = placeHypothesisBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  await handlePlaceHypothesisRequest(dependencies, parsedParams.data, parsedBody.data);
  return reply.code(204).send();
}
