import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleListCapabilitiesRequest,
  type ListCapabilitiesControllerDependencies,
} from './list-capabilities.controller.js';
import { listCapabilitiesQuerySchema } from './dto/list-capabilities.dto.js';

const API_PREFIX = '/v1';

export function createListCapabilitiesRoutesPlugin(
  dependencies: ListCapabilitiesControllerDependencies,
): FastifyPluginAsync {
  return async function listCapabilitiesRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/capabilities`, (request, reply) => listCapabilitiesHandler(dependencies, request, reply));
  };
}

async function listCapabilitiesHandler(
  dependencies: ListCapabilitiesControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = listCapabilitiesQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request query failed validation', details: issues } });
  }
  const page = await handleListCapabilitiesRequest(dependencies, parsed.data);
  return reply.code(200).send(page);
}
