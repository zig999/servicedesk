import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleDraftCapabilitySchemaFromOpenApiRequest,
  type DraftCapabilitySchemaFromOpenApiControllerDependencies,
} from './draft-capability-schema-from-openapi.controller.js';
import { draftCapabilitySchemaFromOpenApiRequestSchema } from './dto/draft-capability-schema-from-openapi.dto.js';

const API_PREFIX = '/v1';

export function createDraftCapabilitySchemaFromOpenApiRoutesPlugin(
  dependencies: DraftCapabilitySchemaFromOpenApiControllerDependencies,
): FastifyPluginAsync {
  return async function draftCapabilitySchemaFromOpenApiRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/draft-capability-schema-from-openapi`, (request, reply) =>
      draftCapabilitySchemaFromOpenApiHandler(dependencies, request, reply),
    );
  };
}

async function draftCapabilitySchemaFromOpenApiHandler(
  dependencies: DraftCapabilitySchemaFromOpenApiControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = draftCapabilitySchemaFromOpenApiRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply
      .code(400)
      .send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const draft = await handleDraftCapabilitySchemaFromOpenApiRequest(dependencies, parsed.data);
  return reply.code(200).send(draft);
}
