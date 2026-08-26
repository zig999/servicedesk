// Maps one validated read-connector-configuration request to the published
// readConnectorConfiguration call, and the resulting
// ConnectorConfigurationResolution back to the wire response
// (task/connector-configuration-authoring/read-connector-configuration-route,
// task/registry-reads/connector-configuration-response-wire-type,
// contracts/integration/connector-configuration-registry): transport in,
// transport out, no business decision of its own — the connector identity
// travels through unchanged, and configuration is answered exactly as the
// registry holds and answers it: JSON object text
// (domain/integration/connector-configuration,
// task/connector-configuration-registration-conformance/configuration-held-as-text)
// — never re-parsed or re-serialized here (toReadConnectorConfigurationResponse
// below).
// Receives its one dependency as a plain function type (ARC-01) — the
// ConnectorConfigurationRegistryService's own
// readConnectorConfigurationOrThrow wrapper — rather than constructing
// ConnectorConfigurationRegistryService or its store itself (ARC-02), the
// same shape register-connector.controller.ts's
// own RegisterConnectorControllerDependencies already takes for this
// registry's write side; the composition root that builds it is
// build-app.factory.ts's own composeResources, reusing the same
// ConnectorConfigurationRegistryService instance registerConnector already
// shares.
//
// The held-check-and-throw this controller used to perform itself
// (task/registry-read-not-found-relocation-and-rate-limit/connector-configuration-not-found-relocation)
// now lives in ConnectorConfigurationRegistryService.readConnectorConfigurationOrThrow
// — COR-03's own "a service raises business errors" — so this handler only
// awaits that wrapper and projects whatever it resolves onto the wire
// response; a miss reaches this module as a thrown
// ConnectorConfigurationNotFoundError rather than a `held: false` value this
// controller would otherwise branch on.
// ConnectorConfigurationRegistryService.readConnectorConfiguration itself is
// unaffected: it still answers an unregistered connector as ordinary data
// (`{ held: false, connector }`), never a thrown error, for every other
// consumer that reads it directly (the wrapper included, internally). The
// propagated ConnectorConfigurationNotFoundError's own transport status is
// HTTP 404, the specification's own decision
// (rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused);
// COR-04's shared status map (src/errors/status-map.ts) is where that
// decision is enacted rather than chosen inline — mirroring
// read-capability.controller.ts's own handling of ConceptNotAnsweredError
// for the sibling registry.
//
// toReadConnectorConfigurationResponse projects the domain's own
// ConnectorConfiguration (connector-configuration.ts) — whose configuration
// field the registry now holds as JSON object text, exactly the type
// domain/integration/connector-configuration declares
// (task/connector-configuration-registration-conformance/configuration-held-as-text)
// — onto the wire response unchanged, consistent with the JSON text
// register-connector.dto.ts's own registerConnectorBodySchema already
// carries it as. Exported so
// list-connector-configurations.controller.ts's own per-item projection can
// call this exact function rather than restating it (MNT-03) — both routes
// answer the same connector-configuration wire shape, so the projection
// belongs in one place, not two, mirroring read-case.controller.ts's own
// toReadCaseResponse being exported for release.controller.ts's and
// update-draft.controller.ts's identical reuse.

import type { ConnectorConfiguration } from '../connector-registry/connector-configuration.js';
import type {
  ReadConnectorConfigurationParamsDto,
  ReadConnectorConfigurationResponseDto,
} from './dto/read-connector-configuration.dto.js';

/** Everything the controller needs beyond one request's own path parameter: ConnectorConfigurationRegistryService's own readConnectorConfigurationOrThrow wrapper, alone. */
export type ReadConnectorConfigurationControllerDependencies = {
  readonly readConnectorConfiguration: (connector: string) => Promise<ConnectorConfiguration>;
};

/**
 * Handles one read-connector-configuration request end to end: resolves the
 * named connector through readConnectorConfigurationOrThrow, answering with
 * the held configuration's whole projected wire shape
 * (toReadConnectorConfigurationResponse below) where one currently answers
 * that name, and leaving that wrapper's own thrown
 * ConnectorConfigurationNotFoundError — for the shared status map to
 * resolve — to propagate where it answers no configuration. No
 * held-check-and-throw of its own: the resolution the wrapper already
 * committed to is projected onto the wire as is.
 */
export async function handleReadConnectorConfigurationRequest(
  dependencies: ReadConnectorConfigurationControllerDependencies,
  params: ReadConnectorConfigurationParamsDto,
): Promise<ReadConnectorConfigurationResponseDto> {
  const configuration = await dependencies.readConnectorConfiguration(params.connector);
  return toReadConnectorConfigurationResponse(configuration);
}

/**
 * Projects the domain's own connector configuration
 * (connector-configuration.ts's own ConnectorConfiguration) onto the wire
 * response: connector unchanged, and configuration answered exactly as the
 * registry holds it — JSON object text, exactly the type
 * domain/integration/connector-configuration declares
 * (task/connector-configuration-registration-conformance/configuration-held-as-text)
 * — never re-parsed or re-serialized, since the registry already holds and
 * answers it as text either way it was originally supplied
 * (rules/integration/a-connector-configuration-holds-a-well-formed-object).
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
    configuration: configuration.configuration,
  };
}
