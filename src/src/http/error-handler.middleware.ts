// The one place an uncaught error becomes a transport status
// (COR-04 — "Every domain error maps to a transport status in one place, and
// no handler chooses a status inline"): everything this route or its
// controller lets propagate lands here, answered in one envelope carrying a
// code, a message and its details (API-05). This handler consults the one
// status-map table (task/case-lifecycle-http/status-map, src/errors/status-map.ts)
// rather than choosing a status itself: an error already carrying a
// client-range status (Fastify's own body-parsing refusals among them)
// answers with that status and its own message, never an internal detail,
// since Fastify's own 4xx messages describe the request rather than the
// server (SEC-04); a typed domain error the status map names answers with
// the status it assigns, its own name as the code and its own context as
// details (COR-02's own context field, API-05's details); anything else —
// every thrown value the map does not name — answers 500 with a fixed,
// generic message, so no stack trace or internal detail ever reaches the
// client, unchanged from before the status map existed.

import type { FastifyReply, FastifyRequest } from 'fastify';
import { statusForError } from '../errors/status-map.js';

/** One error envelope: a code, a message and its details (API-05) — details omitted where there are none to give safely. */
type ErrorEnvelope = { readonly error: { readonly code: string; readonly message: string; readonly details?: unknown } };

/** A typed domain error carrying the context object every one of this codebase's own error classes declares (COR-02). */
type DomainErrorWithContext = Error & { readonly context: unknown };

/**
 * Answers every uncaught error: a client-range status already set on the
 * error (Fastify's own request-parsing refusals) is honored with its own
 * message; a typed domain error the status map names answers with the
 * status it assigns; anything else answers 500 with a fixed message, never
 * the original error's own text (SEC-04).
 */
export function handleUnexpectedError(error: unknown, _request: FastifyRequest, reply: FastifyReply): FastifyReply {
  if (isClientError(error)) {
    return reply.code(error.statusCode).send(clientEnvelope(error));
  }
  if (error instanceof Error) {
    const mappedStatus = statusForError(error);
    if (mappedStatus !== undefined) {
      return reply.code(mappedStatus).send(domainEnvelope(error));
    }
  }
  return reply.code(500).send({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
}

/** Narrows an unknown thrown value to one already carrying a client-range (< 500) statusCode, the shape Fastify's own request-parsing refusals carry. */
function isClientError(error: unknown): error is { statusCode: number; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as { statusCode: unknown }).statusCode === 'number' &&
    (error as { statusCode: number }).statusCode < 500 &&
    'message' in error
  );
}

/** The envelope for an error that already named its own client-range status and message. */
function clientEnvelope(error: { statusCode: number; message: string }): ErrorEnvelope {
  return { error: { code: 'BAD_REQUEST', message: error.message } };
}

/** Narrows a typed domain error to one carrying the context object every one of this codebase's own error classes declares (COR-02). */
function hasContext(error: Error): error is DomainErrorWithContext {
  return 'context' in error;
}

/** The envelope for a typed domain error the status map named: its own class name as the code, its own message, and its own context as details where it carries one. */
function domainEnvelope(error: Error): ErrorEnvelope {
  if (hasContext(error)) {
    return { error: { code: error.name, message: error.message, details: error.context } };
  }
  return { error: { code: error.name, message: error.message } };
}
