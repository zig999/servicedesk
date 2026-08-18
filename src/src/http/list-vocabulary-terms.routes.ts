// Registers GET /v1/glossary/{vocabulary} (task/glossary-query-http/list-vocabulary-terms-route,
// contracts/glossary/glossary-query): validates the path parameter against
// listVocabularyTermsParamsSchema and the query string against listVocabularyTermsQuerySchema
// before the controller is ever reached (DTO-01, EDG-01) — :vocabulary against the closed set of
// five term vocabularies, offset/limit exactly as list-cases.routes.ts and list-concepts.routes.ts
// already validate their own — then hands both parsed DTOs straight to
// handleListVocabularyTermsRequest and answers with whatever page it resolves. The route sits under
// the same versioned prefix diagnose.routes.ts already established (API-06), spelled under
// /glossary the same way read-vocabulary-term.routes.ts's own path is, and this module constructs
// none of its own dependencies (ARC-02) — they arrive as this plugin's own closure, built once by
// whichever factory eventually wires this route (src/factories/glossary.factory.ts's own
// createGlossaryQuery).
//
// This route's own path — `${API_PREFIX}/glossary/:vocabulary` — is a distinct shape from both of
// its glossary-listing siblings: list-concepts.routes.ts registers the static
// `${API_PREFIX}/glossary/concepts`, which Fastify matches ahead of any parameterized route
// regardless of registration order, and read-vocabulary-term.routes.ts registers the two-segment
// `${API_PREFIX}/glossary/:vocabulary/:name`. None of the three collides with either of the others.
//
// An unrecognized :vocabulary segment answers 400 through the same plain DTO-validation envelope
// every malformed offset or limit already does here — never a domain typed error and never a
// status-map entry — because IGlossaryQuery.listVocabularyTerms raises no typed error of its own
// for an unrecognized vocabulary at all (verified against glossary.service.ts,
// glossary-query.port.ts, and the query-extension task's own implementation and proof); this
// schema's z.enum(TERM_VOCABULARIES) is the whole refusal, exactly as
// read-vocabulary-term.routes.ts's own :vocabulary segment is refused today. GlossaryService.listVocabularyTerms
// raises no other domain error of its own either, so this plugin sets no error handler of its own
// here — it answers through whichever one the app already has registered (COR-04,
// error-handler.middleware.ts), exactly as list-concepts.routes.ts already leaves every propagated
// error to it.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleListVocabularyTermsRequest,
  type ListVocabularyTermsControllerDependencies,
} from './list-vocabulary-terms.controller.js';
import { listVocabularyTermsParamsSchema, listVocabularyTermsQuerySchema } from './dto/list-vocabulary-terms.dto.js';

/** A versioned prefix (API-06), matching diagnose.routes.ts's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the list-vocabulary-terms route as a Fastify plugin closed over the given dependencies —
 * the published glossary-query read plus the configured pagination bound — so the plugin body
 * itself constructs nothing (ARC-02).
 */
export function createListVocabularyTermsRoutesPlugin(
  dependencies: ListVocabularyTermsControllerDependencies,
): FastifyPluginAsync {
  return async function listVocabularyTermsRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.get(`${API_PREFIX}/glossary/:vocabulary`, (request, reply) =>
      listVocabularyTermsHandler(dependencies, request, reply),
    );
  };
}

/**
 * Validates the path parameter and the query string before the controller is reached (DTO-01,
 * EDG-01): a :vocabulary segment outside the five term vocabularies, or an offset/limit present but
 * malformed, answers 400 with the validation envelope, naming every violated field; otherwise the
 * controller's own resolved page answers 200, unchanged.
 */
async function listVocabularyTermsHandler(
  dependencies: ListVocabularyTermsControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsedParams = listVocabularyTermsParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    const issues = parsedParams.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const parsedQuery = listVocabularyTermsQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    const issues = parsedQuery.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request query failed validation', details: issues } });
  }
  const page = await handleListVocabularyTermsRequest(dependencies, parsedParams.data, parsedQuery.data);
  return reply.code(200).send(page);
}
