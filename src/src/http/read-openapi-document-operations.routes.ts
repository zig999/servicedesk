import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReadOpenApiDocumentOperationsRequest,
  type ReadOpenApiDocumentOperationsControllerDependencies,
} from './read-openapi-document-operations.controller.js';
import { readOpenApiDocumentOperationsRequestSchema } from './dto/read-openapi-document-operations.dto.js';

const API_PREFIX = '/v1';

export function createReadOpenApiDocumentOperationsRoutesPlugin(
  dependencies: ReadOpenApiDocumentOperationsControllerDependencies,
): FastifyPluginAsync {
  return async function readOpenApiDocumentOperationsRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/read-openapi-document-operations`, (request, reply) =>
      readOpenApiDocumentOperationsHandler(dependencies, request, reply),
    );
  };
}

async function readOpenApiDocumentOperationsHandler(
  dependencies: ReadOpenApiDocumentOperationsControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = readOpenApiDocumentOperationsRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const result = await handleReadOpenApiDocumentOperationsRequest(dependencies, parsed.data);
  return reply.code(200).send(result);
}
