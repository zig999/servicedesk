// Registers GET /v1/glossary/{vocabulary}/{name} (task/glossary-query-http/read-vocabulary-term-route,
// contracts/glossary/glossary-query): validates both path parameters against
// readVocabularyTermParamsSchema before the controller is ever reached (DTO-01, EDG-01) — :vocabulary
// against the closed set of five term vocabularies, :name against non-empty — then hands the
// parsed DTO straight to handleReadVocabularyTermRequest and answers with whatever it resolves.
// The route sits under the same versioned prefix diagnose.routes.ts already established (API-06),
// and this module constructs none of its own dependencies (ARC-02) — they arrive as this plugin's
// own closure, built once by whichever factory wires this route into the running app. A domain
// refusal the controller raises (VocabularyTermNotHeldError) is left to propagate: this plugin
// sets no error handler of its own, so it answers through whichever one the app already has
// registered (COR-04, error-handler.middleware.ts), exactly as read-concept.routes.ts leaves every
// propagated error to it today.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReadVocabularyTermRequest,
  type ReadVocabularyTermControllerDependencies,
} from './read-vocabulary-term.controller.js';
import { readVocabularyTermParamsSchema } from './dto/read-vocabulary-term.dto.js';

/** A versioned prefix (API-06), matching diagnose.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the read-vocabulary-term route as a Fastify plugin closed over the given dependencies —
 * the published glossary-query read — so the plugin body itself constructs nothing (ARC-02).
 */
export function createReadVocabularyTermRoutesPlugin(
  dependencies: ReadVocabularyTermControllerDependencies,
): FastifyPluginAsync {
  return async function readVocabularyTermRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/glossary/:vocabulary/:name`, (request, reply) =>
      readVocabularyTermHandler(dependencies, request, reply),
    );
  };
}

/**
 * Validates both path parameters before the controller is reached (DTO-01, EDG-01): a request
 * whose :vocabulary or :name segment fails readVocabularyTermParamsSchema answers 400 with the
 * validation envelope, naming every violated field; otherwise the controller's own resolved term
 * answers 200, unchanged, and a thrown VocabularyTermNotHeldError is left to reach the app's
 * shared error handler.
 */
async function readVocabularyTermHandler(
  dependencies: ReadVocabularyTermControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = readVocabularyTermParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const term = await handleReadVocabularyTermRequest(dependencies, parsed.data);
  return reply.code(200).send(term);
}
