// The one place an uncaught error becomes a transport status
// (COR-04 — "Every domain error maps to a transport status in one place, and
// no handler chooses a status inline"): everything this route or its
// controller lets propagate lands here, answered in one envelope carrying a
// code, a message and its details (API-05). No specification node or this
// project's own standard names which domain error maps to which status — the
// standard's own elsewhere note says that table is this project's to write,
// deliberately, in code — so this handler makes no such table: an error
// already carrying a client-range status (Fastify's own body-parsing
// refusals among them) answers with that status and its own message: never
// an internal detail, since Fastify's own 4xx messages describe the request
// rather than the server (SEC-04); anything else — every thrown domain error
// this task's own criteria never named a status for — answers 500 with a
// fixed, generic message, so no stack trace or internal detail ever reaches
// the client.

import type { FastifyReply, FastifyRequest } from 'fastify';

/** One error envelope: a code, a message and its details (API-05) — details omitted where there are none to give safely. */
type ErrorEnvelope = { readonly error: { readonly code: string; readonly message: string } };

/**
 * Answers every uncaught error the same generic way: a client-range status
 * already set on the error (Fastify's own request-parsing refusals) is
 * honored with its own message; anything else answers 500 with a fixed
 * message, never the original error's own text (SEC-04).
 */
export function handleUnexpectedError(error: unknown, _request: FastifyRequest, reply: FastifyReply): FastifyReply {
  if (isClientError(error)) {
    return reply.code(error.statusCode).send(clientEnvelope(error));
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
