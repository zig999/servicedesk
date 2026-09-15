import type { IOpenApiDocumentFetcher } from '../connector-registry/openapi-document-fetcher.port.js';
import { generateCapabilitySchemaDraft } from '../connector-registry/capability-schema-draft-generation.js';
import type { CapabilitySchemaDraft } from '../connector-registry/capability-schema-draft.js';
import type { DraftCapabilitySchemaFromOpenApiRequestDto } from './dto/draft-capability-schema-from-openapi.dto.js';

export type DraftCapabilitySchemaFromOpenApiControllerDependencies = {
  readonly documentFetcher: IOpenApiDocumentFetcher;
};

export async function handleDraftCapabilitySchemaFromOpenApiRequest(
  dependencies: DraftCapabilitySchemaFromOpenApiControllerDependencies,
  body: DraftCapabilitySchemaFromOpenApiRequestDto,
): Promise<CapabilitySchemaDraft> {
  return generateCapabilitySchemaDraft({ ...body, ...dependencies });
}
