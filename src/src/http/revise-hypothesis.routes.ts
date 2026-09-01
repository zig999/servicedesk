import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleReviseHypothesisRequest, type ReviseHypothesisControllerDependencies } from './revise-hypothesis.controller.js';
import { reviseHypothesisBodySchema, reviseHypothesisParamsSchema } from './dto/revise-hypothesis.dto.js';

const API_PREFIX = '/v1';

export function createReviseHypothesisRoutesPlugin(dependencies: ReviseHypothesisControllerDependencies): FastifyPluginAsync {
  return async function reviseHypothesisRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/cases/:slug/hypotheses`, (request, reply) => reviseHypothesisHandler(dependencies, request, reply));
  };
}

async function reviseHypothesisHandler(
  dependencies: ReviseHypothesisControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = reviseHypothesisParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedBody = reviseHypothesisBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const revisedHypothesis = await handleReviseHypothesisRequest(dependencies, parsedParams.data, parsedBody.data);
  return reply.code(201).send(revisedHypothesis);
}
