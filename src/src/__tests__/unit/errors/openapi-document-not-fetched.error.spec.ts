import { expect, it } from 'vitest';
import { OpenApiDocumentNotFetchedError } from '../../../errors/openapi-document-not-fetched.error.js';

const A_LINK = 'https://api.example.com/openapi.json';

it('names itself OpenApiDocumentNotFetchedError and carries only the link and kind in context for a network failure', () => {
  const error = new OpenApiDocumentNotFetchedError(A_LINK, { kind: 'network-failure' });

  expect(error.name).toBe('OpenApiDocumentNotFetchedError');
  expect(error.context).toEqual({ link: A_LINK, kind: 'network-failure' });
});

it('carries only the link and kind in context for a timeout, naming no status at all', () => {
  const error = new OpenApiDocumentNotFetchedError(A_LINK, { kind: 'timeout' });

  expect(error.context).toEqual({ link: A_LINK, kind: 'timeout' });
});

it('carries the answered status in context for a status-outside-2xx outcome, alongside the link and kind', () => {
  const error = new OpenApiDocumentNotFetchedError(A_LINK, { kind: 'status-outside-2xx', status: 404 });

  expect(error.context).toEqual({ link: A_LINK, kind: 'status-outside-2xx', status: 404 });
});

it('preserves the underlying rejection as its own cause when one is given', () => {
  const transportRejection = new Error('a genuine network failure');

  const error = new OpenApiDocumentNotFetchedError(A_LINK, { kind: 'network-failure' }, { cause: transportRejection });

  expect(error.cause).toBe(transportRejection);
});

it('constructs with no cause at all when none is given, rather than requiring one', () => {
  const error = new OpenApiDocumentNotFetchedError(A_LINK, { kind: 'network-failure' });

  expect(error.cause).toBeUndefined();
});

it("builds its own message from the outcome alone, never embedding the underlying rejection's own text", () => {
  const transportRejection = new Error('a-secret-internal-detail-marker');

  const error = new OpenApiDocumentNotFetchedError(A_LINK, { kind: 'network-failure' }, { cause: transportRejection });

  expect(error.message).not.toContain('a-secret-internal-detail-marker');
  expect(error.message).toContain(A_LINK);
});
