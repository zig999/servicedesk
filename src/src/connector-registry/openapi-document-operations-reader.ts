import { readOpenApiDocument, isPlainObject } from './openapi-document-reader.js';
import type { OpenApiDocument } from './openapi-document-reader.js';
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

function operationsDeclaredBy(document: OpenApiDocument): readonly OpenApiOperation[] {
  const paths = document.paths;
  return isPlainObject(paths)
    ? Object.entries(paths).flatMap(([path, pathItem]) => operationsAt(document, path, pathItem))
    : [];
}

function operationsAt(document: OpenApiDocument, path: string, pathItem: unknown): readonly OpenApiOperation[] {
  const resolvedPathItem = pathItemReferencedBy(document, pathItem);
  if (!isPlainObject(resolvedPathItem)) {
    return [];
  }
  return Object.keys(resolvedPathItem)
    .filter(isOpenApiMethodKey)
    .map((method) => ({ path, method: method.toUpperCase() }));
}

function pathItemReferencedBy(document: OpenApiDocument, pathItem: unknown): unknown {
  if (!isPlainObject(pathItem) || typeof pathItem.$ref !== 'string') {
    return pathItem;
  }
  return documentValueAtPointer(document, pathItem.$ref);
}

function documentValueAtPointer(document: OpenApiDocument, pointer: string): unknown {
  if (!pointer.startsWith('#/')) {
    return undefined;
  }
  return pointer
    .slice(2)
    .split('/')
    .map(decodedPointerSegment)
    .reduce<unknown>((node, segment) => (isPlainObject(node) && segment in node ? node[segment] : undefined), document);
}

function decodedPointerSegment(segment: string): string {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

function isOpenApiMethodKey(key: string): boolean {
  return (OPENAPI_PATH_ITEM_METHODS as readonly string[]).includes(key.toLowerCase());
}
