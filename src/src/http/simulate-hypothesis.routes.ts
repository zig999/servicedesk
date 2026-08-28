// Registers POST /v1/simulate/hypothesis
// (task/case-simulation-pipeline/simulate-hypothesis-operation,
// contracts/investigation/case-simulation): validates the raw body against
// simulateHypothesisRequestSchema before the controller is ever reached
// (DTO-01, EDG-01), then hands the parsed DTO straight to
// handleSimulateHypothesisRequest and answers with whatever it resolves. The
// route sits under the same versioned prefix diagnose.routes.ts and
// simulate-case.routes.ts already use (API-06), nested under simulate itself
// the way contracts/investigation/case-simulation names both operations
// together. This module constructs none of its own dependencies (ARC-02) —
// they arrive as this plugin's own closure, built once by
// createDiagnoseHttpServer. Nothing here reads request.headers at all, so
// the requester the response is computed under is exactly the one the
// request body named — no authentication or authorization header is read.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { handleSimulateHypothesisRequest, type SimulateHypothesisControllerDependencies } from './simulate-hypothesis.controller.js';
import { simulateHypothesisRequestSchema } from './dto/simulate-hypothesis.dto.js';

/** The same versioned prefix (API-06) diagnose.routes.ts and simulate-case.routes.ts already declare — duplicated here rather than imported, since neither declares it exported. */
const API_PREFIX = '/v1';

/**
 * Builds the simulate-hypothesis route as a Fastify plugin closed over the
 * given dependencies — the published case read, the glossary-source port and
 * the wired production hypothesis-simulation runner — so the plugin body
 * itself constructs nothing (ARC-02); createDiagnoseHttpServer is the one
 * factory that builds every one of them.
 */
export function createSimulateHypothesisRoutesPlugin(dependencies: SimulateHypothesisControllerDependencies): FastifyPluginAsync {
  return async function simulateHypothesisRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.post(`${API_PREFIX}/simulate/hypothesis`, (request, reply) => simulateHypothesisHandler(dependencies, request, reply));
  };
}

/**
 * Validates the raw body before the controller is reached (DTO-01, EDG-01):
 * a body failing simulateHypothesisRequestSchema answers 400 with the
 * validation envelope, naming every violated field; otherwise the
 * controller's own resolved record answers 200, unchanged.
 */
async function simulateHypothesisHandler(
  dependencies: SimulateHypothesisControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = simulateHypothesisRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });
  }
  const result = await handleSimulateHypothesisRequest(dependencies, parsed.data);
  return reply.code(200).send(result);
}
