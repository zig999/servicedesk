import { expect, it } from 'vitest';
import { readOpenApiDocument } from '../../../connector-registry/openapi-document-reader.js';
import { OpenApiDocumentNotReadableError } from '../../../errors/openapi-document-not-readable.error.js';

function notReadableErrorThrownBy(act: () => unknown): OpenApiDocumentNotReadableError {
  try {
    act();
  } catch (error) {
    if (error instanceof OpenApiDocumentNotReadableError) {
      return error;
    }
    throw error;
  }
  throw new Error('expected readOpenApiDocument to refuse with OpenApiDocumentNotReadableError, but it did not throw');
}

it('returns the fetched document parsed whole, with every top-level member and every path it declares, performing no path or method lookup', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    info: { title: 'Widgets API' },
    paths: { '/widgets': { get: {}, post: {} }, '/gadgets': { delete: {} } },
  });

  const document = readOpenApiDocument(documentText);

  expect(document).toEqual(JSON.parse(documentText));
});

it('refuses text that parses as neither JSON nor YAML, naming the fetched document text as what failed to parse', () => {
  const documentText = 'openapi: "3.0.0"\n\tpaths: {}';

  const error = notReadableErrorThrownBy(() => readOpenApiDocument(documentText));

  expect(error.context).toEqual({ kind: 'unparseable', detail: 'the fetched document text' });
});

it('refuses a document whose declared openapi version is present but outside the 3.x line, naming the declared version', () => {
  const documentText = JSON.stringify({ openapi: '2.5.0', paths: {} });

  const error = notReadableErrorThrownBy(() => readOpenApiDocument(documentText));

  expect(error.context).toEqual({ kind: 'unsupported-version', declaredVersion: '2.5.0' });
});

it('refuses a document declaring neither an openapi nor a swagger field, naming that no version was declared', () => {
  const documentText = JSON.stringify({ paths: {} });

  const error = notReadableErrorThrownBy(() => readOpenApiDocument(documentText));

  expect(error.context).toEqual({ kind: 'no-version-declared' });
});

it('refuses a document whose paths member is not a plain object, even though its declared version is a supported OpenAPI 3.x one', () => {
  const documentText = JSON.stringify({ openapi: '3.0.0', paths: 'not-an-object' });

  const error = notReadableErrorThrownBy(() => readOpenApiDocument(documentText));

  expect(error).toBeInstanceOf(OpenApiDocumentNotReadableError);
});
