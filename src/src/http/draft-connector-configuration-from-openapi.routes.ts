import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleDraftConnectorConfigurationFromOpenApiRequest,
  type DraftConnectorConfigurationFromOpenApiControllerDependencies,
} from './draft-connector-configuration-from-openapi.controller.js';
import { draftConnectorConfigurationFromOpenApiRequestSchema } from './dto/draft-connector-configuration-from-openapi.dto.js';

const API_PREFIX = '/v1';

export function createDraftConnectorConfigurationFromOpenApiRoutesPlugin(
  dependencies: DraftConnectorConfigurationFromOpenApiControllerDependencies,
): FastifyPluginAsync {
  return async function draftConnectorConfigurationFromOpenApiRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/draft-connector-configuration-from-openapi`, (request, reply) =>
      draftConnectorConfigurationFromOpenApiHandler(dependencies, request, reply),
    );
  };
}

async function draftConnectorConfigurationFromOpenApiHandler(
  dependencies: DraftConnectorConfigurationFromOpenApiControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = draftConnectorConfigurationFromOpenApiRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const draft = await handleDraftConnectorConfigurationFromOpenApiRequest(dependencies, parsed.data);
  return reply.code(200).send(draft);
}
