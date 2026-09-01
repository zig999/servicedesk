import type { FastifyReply, FastifyRequest } from 'fastify';
import { statusForError } from '../errors/status-map.js';

type ErrorEnvelope = { readonly error: { readonly code: string; readonly message: string; readonly details?: unknown } };

type DomainErrorWithContext = Error & { readonly context: unknown };

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

function clientEnvelope(error: { statusCode: number; message: string }): ErrorEnvelope {
  return { error: { code: 'BAD_REQUEST', message: error.message } };
}

function hasContext(error: Error): error is DomainErrorWithContext {
  return 'context' in error;
}

function domainEnvelope(error: Error): ErrorEnvelope {
  if (hasContext(error)) {
    return { error: { code: error.name, message: error.message, details: error.context } };
  }
  return { error: { code: error.name, message: error.message } };
}
