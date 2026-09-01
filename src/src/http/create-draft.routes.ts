import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleCreateDraftRequest, type CreateDraftControllerDependencies } from './create-draft.controller.js';
import { createDraftBodySchema } from './dto/create-draft.dto.js';

const API_PREFIX = '/v1';

export function createCreateDraftRoutesPlugin(dependencies: CreateDraftControllerDependencies): FastifyPluginAsync {
  return async function createDraftRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/cases`, (request, reply) => createDraftHandler(dependencies, request, reply));
  };
}

async function createDraftHandler(
  dependencies: CreateDraftControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedBody = createDraftBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const createdDraft = await handleCreateDraftRequest(dependencies, parsedBody.data);
  return reply.code(201).send(createdDraft);
}
