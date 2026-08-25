// Maps one validated read-connector-configuration request to the published
// readConnectorConfiguration call, and the resulting
// ConnectorConfigurationResolution back to the wire response
// (task/connector-configuration-authoring/read-connector-configuration-route,
// task/registry-reads/connector-configuration-response-wire-type,
// contracts/integration/connector-configuration-registry): transport in,
// transport out, no business decision of its own — the connector identity
// travels through unchanged, and configuration is re-serialized to the
// wire's own JSON-string representation (toReadConnectorConfigurationResponse
// below) rather than answered as the plain object the registry holds it as.
// Receives its one dependency as a plain function type (ARC-01) — the
// readConnectorConfiguration operation alone — rather than constructing
// ConnectorConfigurationRegistryService or its store itself (ARC-02), the
// same shape register-connector.controller.ts's
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
//
// toReadConnectorConfigurationResponse projects the domain's own
// ConnectorConfiguration (connector-configuration.ts) — whose configuration
// field the registry holds as a plain object — onto the wire response,
// re-serializing that object back to the JSON string
// domain/integration/connector-configuration declares configuration's type
// to be (task/registry-reads/connector-configuration-response-wire-type),
// consistent with the JSON text register-connector.dto.ts's own
// registerConnectorBodySchema already carries it as. Exported so
// list-connector-configurations.controller.ts's own per-item projection can
// call this exact function rather than restating it (MNT-03) — both routes
// answer the same connector-configuration wire shape, so the projection
// belongs in one place, not two, mirroring read-case.controller.ts's own
// toReadCaseResponse being exported for release.controller.ts's and
// update-draft.controller.ts's identical reuse.

import type { ConnectorConfigurationResolution } from '../connector-registry/connector-configuration-registry.service.js';
import type { ConnectorConfiguration } from '../connector-registry/connector-configuration.js';
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
 * read, answers with the held configuration projected onto the wire shape
 * (toReadConnectorConfigurationResponse below) where one currently answers
 * that name, and raises ConnectorConfigurationNotFoundError — for the shared
 * status map to resolve — where the resolution answers `held: false`.
 */
export async function handleReadConnectorConfigurationRequest(
  dependencies: ReadConnectorConfigurationControllerDependencies,
  params: ReadConnectorConfigurationParamsDto,
): Promise<ReadConnectorConfigurationResponseDto> {
  const resolution = await dependencies.readConnectorConfiguration(params.connector);
  if (!resolution.held) {
    throw new ConnectorConfigurationNotFoundError(resolution.connector);
  }
  return toReadConnectorConfigurationResponse(resolution.configuration);
}

/**
 * Projects the domain's own connector configuration
 * (connector-configuration.ts's own ConnectorConfiguration) onto the wire
 * response: connector unchanged, and configuration re-serialized from the
 * plain object the registry holds it as back into the JSON string
 * domain/integration/connector-configuration declares its type to be
 * (task/registry-reads/connector-configuration-response-wire-type) —
 * parsing that string back reproduces the same JSON value the connector was
 * registered with, since connector-configuration-registry.service.ts's own
 * wellFormedConfiguration only ever holds a configuration that already
 * parsed from well-formed JSON text.
 *
 * Exported so list-connector-configurations.controller.ts's own per-item
 * projection can reuse this exact function rather than restating it
 * (MNT-03) — both routes answer the same connector-configuration wire
 * shape.
 */
export function toReadConnectorConfigurationResponse(
  configuration: ConnectorConfiguration,
): ReadConnectorConfigurationResponseDto {
  return {
    connector: configuration.connector,
    configuration: JSON.stringify(configuration.configuration),
  };
}
