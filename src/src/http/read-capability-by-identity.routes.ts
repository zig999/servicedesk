import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReadCapabilityByIdentityRequest,
  type ReadCapabilityByIdentityControllerDependencies,
} from './read-capability-by-identity.controller.js';
import { readCapabilityByIdentityParamsSchema } from './dto/read-capability-by-identity.dto.js';
import { createReadCapabilityByIdentityRateLimitHook } from './read-capability-by-identity-rate-limit.middleware.js';

const API_PREFIX = '/v1';

export function createReadCapabilityByIdentityRoutesPlugin(
  dependencies: ReadCapabilityByIdentityControllerDependencies,
): FastifyPluginAsync {
  return async function readCapabilityByIdentityRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.addHook('onRequest', createReadCapabilityByIdentityRateLimitHook());
    app.get(`${API_PREFIX}/capabilities/:name/:version`, (request, reply) =>
      readCapabilityByIdentityHandler(dependencies, request, reply),
    );
  };
}

async function readCapabilityByIdentityHandler(
  dependencies: ReadCapabilityByIdentityControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = readCapabilityByIdentityParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const capability = await handleReadCapabilityByIdentityRequest(dependencies, parsed.data);
  return reply.code(200).send(capability);
}
