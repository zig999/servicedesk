// Maps one validated read-connector-configuration request to the published
// readConnectorConfiguration call, and the resulting
// ConnectorConfigurationResolution back to the wire response
// (task/connector-configuration-authoring/read-connector-configuration-route,
// contracts/integration/connector-configuration-registry): transport in,
// transport out, no business decision of its own — the connector
// configuration's own attributes travel through unchanged. Receives its one
// dependency as a plain function type (ARC-01) — the readConnectorConfiguration
// operation alone — rather than constructing ConnectorConfigurationRegistryService
// or its store itself (ARC-02), the same shape register-connector.controller.ts's
// own RegisterConnectorControllerDependencies already takes for this
// registry's write side; the composition root that builds it is
// build-app.factory.ts's own composeResources, reusing the same
// ConnectorConfigurationRegistryService instance registerConnector already
// shares.
//
// The one decision this controller does make is not a domain fact: the
// domain's own read-connector-configuration answers an unregistered
// connector as ordinary data (`{ held: false, connector }`, never a thrown
// error — connector-configuration-registry.service.ts's own
// ConnectorConfigurationResolution). Which transport status that ordinary
// absence becomes is COR-04's concern, not this specification's, so this
// controller raises ConnectorConfigurationNotFoundError once it has read
// that held: false answer, letting the shared status map
// (src/errors/status-map.ts) resolve it rather than choosing a status here —
// mirroring read-capability.controller.ts's own handling of
// ConceptNotAnsweredError for the sibling registry.

import type { ConnectorConfigurationResolution } from '../connector-registry/connector-configuration-registry.service.js';
import { ConnectorConfigurationNotFoundError } from '../errors/connector-configuration-not-found.error.js';
import type {
  ReadConnectorConfigurationParamsDto,
  ReadConnectorConfigurationResponseDto,
} from './dto/read-connector-configuration.dto.js';

/** Everything the controller needs beyond one request's own path parameter: the published readConnectorConfiguration read, alone. */
export type ReadConnectorConfigurationControllerDependencies = {
  readonly readConnectorConfiguration: (connector: string) => Promise<ConnectorConfigurationResolution>;
};

/**
 * Handles one read-connector-configuration request end to end: resolves the
 * named connector through the published connector-configuration-registry
 * read, answers with the held configuration's connector and configuration
 * fields where one currently answers that name, and raises
 * ConnectorConfigurationNotFoundError — for the shared status map to resolve
 * — where the resolution answers `held: false`.
 */
export async function handleReadConnectorConfigurationRequest(
  dependencies: ReadConnectorConfigurationControllerDependencies,
  params: ReadConnectorConfigurationParamsDto,
): Promise<ReadConnectorConfigurationResponseDto> {
  const resolution = await dependencies.readConnectorConfiguration(params.connector);
  if (!resolution.held) {
    throw new ConnectorConfigurationNotFoundError(resolution.connector);
  }
  return resolution.configuration;
}
