import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleDiagnoseRequest, type DiagnoseControllerDependencies } from './diagnose.controller.js';
import { diagnoseRequestSchema } from './dto/diagnose.dto.js';
import { createRateLimitHook } from './rate-limit.middleware.js';

const API_PREFIX = '/v1';
const RATE_LIMIT_MAX_REQUESTS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

export function createDiagnoseRoutesPlugin(dependencies: DiagnoseControllerDependencies): FastifyPluginAsync {
  return async function diagnoseRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.addHook(
      'onRequest',
      createRateLimitHook({
        maxRequestsPerWindow: RATE_LIMIT_MAX_REQUESTS_PER_MINUTE,
        windowMs: RATE_LIMIT_WINDOW_MS,
      }),
    );
    app.post(`${API_PREFIX}/diagnose`, (request, reply) => diagnoseHandler(dependencies, request, reply));
  };
}

async function diagnoseHandler(
  dependencies: DiagnoseControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = diagnoseRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const assessment = await handleDiagnoseRequest(dependencies, parsed.data);
  return reply.code(200).send(assessment);
}
