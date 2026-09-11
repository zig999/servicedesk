import {
  readOpenApiDocumentOperations,
  type OpenApiDocumentOperations,
} from '../connector-registry/openapi-document-operations-reader.js';
import type { IOpenApiDocumentFetcher } from '../connector-registry/openapi-document-fetcher.port.js';
import type { ReadOpenApiDocumentOperationsQueryDto } from './dto/read-openapi-document-operations.dto.js';

export type ReadOpenApiDocumentOperationsControllerDependencies = {
  readonly documentFetcher: IOpenApiDocumentFetcher;
};

export async function handleReadOpenApiDocumentOperationsRequest(
  dependencies: ReadOpenApiDocumentOperationsControllerDependencies,
  query: ReadOpenApiDocumentOperationsQueryDto,
): Promise<OpenApiDocumentOperations> {
  return readOpenApiDocumentOperations({ link: query.link, documentFetcher: dependencies.documentFetcher });
}
