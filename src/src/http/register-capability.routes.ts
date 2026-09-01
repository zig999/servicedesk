import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleRegisterCapabilityRequest,
  type RegisterCapabilityControllerDependencies,
} from './register-capability.controller.js';
import { registerCapabilityBodySchema, registerCapabilityParamsSchema } from './dto/register-capability.dto.js';

const API_PREFIX = '/v1';

export function createRegisterCapabilityRoutesPlugin(
  dependencies: RegisterCapabilityControllerDependencies,
): FastifyPluginAsync {
  return async function registerCapabilityRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.put(`${API_PREFIX}/capabilities/:name/:version`, (request, reply) =>
      registerCapabilityHandler(dependencies, request, reply),
    );
  };
}

async function registerCapabilityHandler(
  dependencies: RegisterCapabilityControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = registerCapabilityParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedBody = registerCapabilityBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const capability = await handleRegisterCapabilityRequest(dependencies, parsedParams.data, parsedBody.data);
  return reply.code(200).send(capability);
}
