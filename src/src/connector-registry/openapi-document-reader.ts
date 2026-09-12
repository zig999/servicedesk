import { load as loadYamlDocument } from 'js-yaml';
import { OpenApiDocumentNotReadableError } from '../errors/openapi-document-not-readable.error.js';

export type OpenApiDocument = Readonly<Record<string, unknown>>;

export function readOpenApiDocument(documentText: string): OpenApiDocument {
  const document = parsedOpenApiDocument(documentText);
  refuseUnsupportedVersion(document);
  refuseMalformedPaths(document);
  return document;
}

function parsedOpenApiDocument(documentText: string): OpenApiDocument {
  const parsed = parsedAsJsonOrYaml(documentText);
  if (!isPlainObject(parsed)) {
    throw notReadable('the fetched document text');
  }
  return parsed;
}

function parsedAsJsonOrYaml(documentText: string): unknown {
  try {
    return JSON.parse(documentText);
  } catch {
    return parsedAsYaml(documentText);
  }
}

function parsedAsYaml(documentText: string): unknown {
  try {
    return loadYamlDocument(documentText);
  } catch (error) {
    throw notReadable('the fetched document text', error);
  }
}

function refuseUnsupportedVersion(document: OpenApiDocument): void {
  if (typeof document.openapi === 'string') {
    if (!document.openapi.startsWith('3.')) {
      throw new OpenApiDocumentNotReadableError({ kind: 'unsupported-version', declaredVersion: document.openapi });
    }
    return;
  }
  if (typeof document.swagger === 'string') {
    throw new OpenApiDocumentNotReadableError({ kind: 'unsupported-version', declaredVersion: document.swagger });
  }
  throw new OpenApiDocumentNotReadableError({ kind: 'no-version-declared' });
}

function refuseMalformedPaths(document: OpenApiDocument): void {
  if (document.paths !== undefined && !isPlainObject(document.paths)) {
    throw notReadable("the document's paths member");
  }
}

function notReadable(detail: string, cause?: unknown): OpenApiDocumentNotReadableError {
  return new OpenApiDocumentNotReadableError({ kind: 'unparseable', detail }, cause === undefined ? undefined : { cause });
}

export function isPlainObject(value: unknown): value is OpenApiDocument {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
