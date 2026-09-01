import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleTestConnectorRequest, type TestConnectorControllerDependencies } from './test-connector.controller.js';
import { testConnectorRequestSchema } from './dto/test-connector.dto.js';

const API_PREFIX = '/v1';

export function createTestConnectorRoutesPlugin(dependencies: TestConnectorControllerDependencies): FastifyPluginAsync {
  return async function testConnectorRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/test-connector`, (request, reply) => testConnectorHandler(dependencies, request, reply));
  };
}

async function testConnectorHandler(
  dependencies: TestConnectorControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = testConnectorRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const outcome = await handleTestConnectorRequest(dependencies, parsed.data);
  return reply.code(200).send(outcome);
}
