import { readOpenApiDocument } from './openapi-document-reader.js';
import type { IOpenApiDocumentFetcher } from './openapi-document-fetcher.port.js';

const OPENAPI_PATH_ITEM_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;

export type OpenApiOperation = Readonly<{
  path: string;
  method: string;
}>;

export type OpenApiDocumentOperations = Readonly<{
  operations: readonly OpenApiOperation[];
}>;

export type ReadOpenApiDocumentOperationsOptions = Readonly<{
  link: string;
  documentFetcher: IOpenApiDocumentFetcher;
}>;

export async function readOpenApiDocumentOperations(
  options: ReadOpenApiDocumentOperationsOptions,
): Promise<OpenApiDocumentOperations> {
  const { link, documentFetcher } = options;
  const documentText = await documentFetcher.fetchOpenApiDocument(link);
  const document = readOpenApiDocument(documentText);
  return { operations: operationsDeclaredBy(document) };
}

function operationsDeclaredBy(document: Readonly<Record<string, unknown>>): readonly OpenApiOperation[] {
  const paths = document.paths;
  return isPlainObject(paths)
    ? Object.entries(paths).flatMap(([path, pathItem]) => operationsAt(path, pathItem))
    : [];
}

function operationsAt(path: string, pathItem: unknown): readonly OpenApiOperation[] {
  if (!isPlainObject(pathItem)) {
    return [];
  }
  return Object.keys(pathItem)
    .filter(isOpenApiMethodKey)
    .map((method) => ({ path, method: method.toUpperCase() }));
}

function isOpenApiMethodKey(key: string): boolean {
  return (OPENAPI_PATH_ITEM_METHODS as readonly string[]).includes(key.toLowerCase());
}

function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
