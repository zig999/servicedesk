import { expect, it } from 'vitest';
import { OpenApiDocumentNotReadableError } from '../../../errors/openapi-document-not-readable.error.js';

it('names itself OpenApiDocumentNotReadableError and carries the detail in context for an unparseable document', () => {
  const error = new OpenApiDocumentNotReadableError({ kind: 'unparseable', detail: 'the fetched document text' });

  expect(error.name).toBe('OpenApiDocumentNotReadableError');
  expect(error.context).toEqual({ kind: 'unparseable', detail: 'the fetched document text' });
});

it('carries the declared version in context for an unsupported-version outcome', () => {
  const error = new OpenApiDocumentNotReadableError({ kind: 'unsupported-version', declaredVersion: '2.0' });

  expect(error.context).toEqual({ kind: 'unsupported-version', declaredVersion: '2.0' });
});

it('carries only the kind in context for a no-version-declared outcome, naming no other field', () => {
  const error = new OpenApiDocumentNotReadableError({ kind: 'no-version-declared' });

  expect(error.context).toEqual({ kind: 'no-version-declared' });
});

it('preserves an underlying parse exception as its own cause when one is given', () => {
  const parseFailure = new Error('a genuine yaml syntax error');

  const error = new OpenApiDocumentNotReadableError(
    { kind: 'unparseable', detail: 'the fetched document text' },
    { cause: parseFailure },
  );

  expect(error.cause).toBe(parseFailure);
});

it('constructs with no cause at all when none is given, rather than requiring one', () => {
  const error = new OpenApiDocumentNotReadableError({ kind: 'no-version-declared' });

  expect(error.cause).toBeUndefined();
});

it("builds its own message from the reason alone, never embedding the underlying parse exception's own text", () => {
  const parseFailure = new Error('a-secret-internal-detail-marker');

  const error = new OpenApiDocumentNotReadableError(
    { kind: 'unparseable', detail: 'the fetched document text' },
    { cause: parseFailure },
  );

  expect(error.message).not.toContain('a-secret-internal-detail-marker');
});
