import type { ICapabilitiesReader } from '../connector-registry/capabilities-reader.port.js';
import { generateConnectorConfigurationDraft } from '../connector-registry/connector-configuration-draft-generation.js';
import type { ConnectorConfigurationDraft } from '../connector-registry/connector-configuration-draft.js';
import type { IOpenApiDocumentFetcher } from '../connector-registry/openapi-document-fetcher.port.js';
import type { RegisteredConnectorConfigurationReader } from '../connector-registry/registered-method-comparison.js';
import type { DraftConnectorConfigurationFromOpenApiRequestDto } from './dto/draft-connector-configuration-from-openapi.dto.js';

export type DraftConnectorConfigurationFromOpenApiControllerDependencies = {
  readonly documentFetcher: IOpenApiDocumentFetcher;
  readonly capabilitiesReader: ICapabilitiesReader;
  readonly registry: RegisteredConnectorConfigurationReader;
};

export async function handleDraftConnectorConfigurationFromOpenApiRequest(
  dependencies: DraftConnectorConfigurationFromOpenApiControllerDependencies,
  body: DraftConnectorConfigurationFromOpenApiRequestDto,
): Promise<ConnectorConfigurationDraft> {
  return generateConnectorConfigurationDraft({ ...body, ...dependencies });
}
