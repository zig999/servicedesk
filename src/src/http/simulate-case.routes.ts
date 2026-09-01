import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleSimulateCaseRequest, type SimulateCaseControllerDependencies } from './simulate-case.controller.js';
import { simulateCaseRequestSchema } from './dto/simulate-case.dto.js';

const API_PREFIX = '/v1';

export function createSimulateCaseRoutesPlugin(dependencies: SimulateCaseControllerDependencies): FastifyPluginAsync {
  return async function simulateCaseRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/simulate`, (request, reply) => simulateCaseHandler(dependencies, request, reply));
  };
}

async function simulateCaseHandler(
  dependencies: SimulateCaseControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = simulateCaseRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const result = await handleSimulateCaseRequest(dependencies, parsed.data);
  return reply.code(200).send(result);
}
