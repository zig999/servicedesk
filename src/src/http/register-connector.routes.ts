import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleRegisterConnectorRequest,
  type RegisterConnectorControllerDependencies,
} from './register-connector.controller.js';
import { registerConnectorBodySchema, registerConnectorParamsSchema } from './dto/register-connector.dto.js';

const API_PREFIX = '/v1';

export function createRegisterConnectorRoutesPlugin(
  dependencies: RegisterConnectorControllerDependencies,
): FastifyPluginAsync {
  return async function registerConnectorRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.put(`${API_PREFIX}/connectors/:connector`, (request, reply) =>
      registerConnectorHandler(dependencies, request, reply),
    );
  };
}

async function registerConnectorHandler(
  dependencies: RegisterConnectorControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = registerConnectorParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedBody = registerConnectorBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const configuration = await handleRegisterConnectorRequest(dependencies, parsedParams.data, parsedBody.data);
  return reply.code(200).send(configuration);
}
