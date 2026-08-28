// Registers POST /v1/simulate
// (task/case-simulation-pipeline/simulate-case-operation,
// contracts/investigation/case-simulation): validates the raw body against
// simulateCaseRequestSchema before the controller is ever reached (DTO-01,
// EDG-01), then hands the parsed DTO straight to handleSimulateCaseRequest
// and answers with whatever it resolves. The route sits under the same
// versioned prefix diagnose.routes.ts already uses (API-06), and this module
// constructs none of its own dependencies (ARC-02) — they arrive as this
// plugin's own closure, built once by createDiagnoseHttpServer. Nothing here
// reads request.headers at all, so the requester the response is computed
// under is exactly the one the request body named — no authentication or
// authorization header is read.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleSimulateCaseRequest, type SimulateCaseControllerDependencies } from './simulate-case.controller.js';
import { simulateCaseRequestSchema } from './dto/simulate-case.dto.js';

/** The same versioned prefix (API-06) diagnose.routes.ts already declares — duplicated here rather than imported, since diagnose.routes.ts declares it unexported. */
const API_PREFIX = '/v1';

/**
 * Builds the simulate-case route as a Fastify plugin closed over the given
 * dependencies — the published case read, the glossary-source port and the
 * wired production simulation runner — so the plugin body itself constructs
 * nothing (ARC-02); createDiagnoseHttpServer is the one factory that builds
 * every one of them.
 */
export function createSimulateCaseRoutesPlugin(dependencies: SimulateCaseControllerDependencies): FastifyPluginAsync {
  return async function simulateCaseRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/simulate`, (request, reply) => simulateCaseHandler(dependencies, request, reply));
  };
}

/**
 * Validates the raw body before the controller is reached (DTO-01, EDG-01):
 * a body failing simulateCaseRequestSchema answers 400 with the validation
 * envelope, naming every violated field; otherwise the controller's own
 * resolved record answers 200, unchanged.
 */
async function simulateCaseHandler(
  dependencies: SimulateCaseControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = simulateCaseRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const result = await handleSimulateCaseRequest(dependencies, parsed.data);
  return reply.code(200).send(result);
}
