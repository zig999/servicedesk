import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReadCaseInputRequirementsRequest,
  type CaseInputRequirementsControllerDependencies,
} from './case-input-requirements.controller.js';
import { caseInputRequirementsParamsSchema } from './dto/case-input-requirements.dto.js';

const API_PREFIX = '/v1';

export function createCaseInputRequirementsRoutesPlugin(
  dependencies: CaseInputRequirementsControllerDependencies,
): FastifyPluginAsync {
  return async function caseInputRequirementsRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/cases/:slug/versions/:version/input-requirements`, (request, reply) =>
      caseInputRequirementsHandler(dependencies, request, reply),
    );
  };
}

async function caseInputRequirementsHandler(
  dependencies: CaseInputRequirementsControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = caseInputRequirementsParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const result = await handleReadCaseInputRequirementsRequest(dependencies, parsed.data);
  return reply.code(200).send(result);
}
