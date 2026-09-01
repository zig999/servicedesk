import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleRegisterConceptRequest,
  type RegisterConceptControllerDependencies,
} from './register-concept.controller.js';
import { registerConceptBodySchema, registerConceptParamsSchema } from './dto/register-concept.dto.js';

const API_PREFIX = '/v1';

export function createRegisterConceptRoutesPlugin(
  dependencies: RegisterConceptControllerDependencies,
): FastifyPluginAsync {
  return async function registerConceptRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.put(`${API_PREFIX}/glossary/concepts/:name`, (request, reply) =>
      registerConceptHandler(dependencies, request, reply),
    );
  };
}

async function registerConceptHandler(
  dependencies: RegisterConceptControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = registerConceptParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedBody = registerConceptBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const concept = await handleRegisterConceptRequest(dependencies, parsedParams.data, parsedBody.data);
  return reply.code(200).send(concept);
}
