import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReadCapabilityRequest,
  type ReadCapabilityControllerDependencies,
} from './read-capability.controller.js';
import { readCapabilityParamsSchema } from './dto/read-capability.dto.js';

const API_PREFIX = '/v1';

export function createReadCapabilityRoutesPlugin(
  dependencies: ReadCapabilityControllerDependencies,
): FastifyPluginAsync {
  return async function readCapabilityRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/capabilities/:concept`, (request, reply) => readCapabilityHandler(dependencies, request, reply));
  };
}

async function readCapabilityHandler(
  dependencies: ReadCapabilityControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = readCapabilityParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const capability = await handleReadCapabilityRequest(dependencies, parsed.data);
  return reply.code(200).send(capability);
}
