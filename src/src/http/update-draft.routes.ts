import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleUpdateDraftRequest, type UpdateDraftControllerDependencies } from './update-draft.controller.js';
import { updateDraftBodySchema, updateDraftParamsSchema } from './dto/update-draft.dto.js';

const API_PREFIX = '/v1';

export function createUpdateDraftRoutesPlugin(dependencies: UpdateDraftControllerDependencies): FastifyPluginAsync {
  return async function updateDraftRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.patch(`${API_PREFIX}/cases/:slug/versions/:version`, (request, reply) => updateDraftHandler(dependencies, request, reply));
  };
}

async function updateDraftHandler(
  dependencies: UpdateDraftControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = updateDraftParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedBody = updateDraftBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issues = parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const updatedVersion = await handleUpdateDraftRequest(dependencies, parsedParams.data, parsedBody.data);
  return reply.code(200).send(updatedVersion);
}
