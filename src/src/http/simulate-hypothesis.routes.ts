import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleSimulateHypothesisRequest, type SimulateHypothesisControllerDependencies } from './simulate-hypothesis.controller.js';
import { simulateHypothesisRequestSchema } from './dto/simulate-hypothesis.dto.js';

const API_PREFIX = '/v1';

export function createSimulateHypothesisRoutesPlugin(dependencies: SimulateHypothesisControllerDependencies): FastifyPluginAsync {
  return async function simulateHypothesisRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/simulate/hypothesis`, (request, reply) => simulateHypothesisHandler(dependencies, request, reply));
  };
}

async function simulateHypothesisHandler(
  dependencies: SimulateHypothesisControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = simulateHypothesisRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const result = await handleSimulateHypothesisRequest(dependencies, parsed.data);
  return reply.code(200).send(result);
}
