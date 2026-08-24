// Maps one validated register-connector request to the published
// registerConnector call, and the resulting ConnectorConfiguration back to
// the wire response (task/connector-configuration-authoring/register-connector-route,
// contracts/integration/connector-configuration-registry): transport in,
// transport out, no business decision of its own —
// connector-configuration-registry.service.ts's own registerConnector
// already decides the completeness refusal and the well-formedness refusal
// this task adds (rules/integration/a-connector-configuration-holds-a-well-formed-object)
// and the replace-in-place-by-connector holding, so this controller adds no
// pre-check and no error-mapping logic of its own: the shared status map
// (src/errors/status-map.ts, COR-04) resolves every one of those typed
// errors once it reaches error-handler.middleware.ts.
//
// Receives its one dependency as a plain function type (ARC-01) — the
// registerConnector operation alone — rather than constructing
// ConnectorConfigurationRegistryService or its store itself (ARC-02):
// build-app.factory.ts's own composeResources is the one composition root
// that wires it, the same way register-capability.controller.ts's own
// RegisterCapabilityControllerDependencies narrows CapabilityRegistryService
// to just the one operation it needs.

import type {
  ConnectorConfiguration,
  ConnectorConfigurationRegistration,
} from '../connector-registry/connector-configuration.js';
import type { RegisterConnectorBodyDto, RegisterConnectorParamsDto } from './dto/register-connector.dto.js';

/** Everything the controller needs beyond one request's own path and body: the registerConnector operation alone. */
export type RegisterConnectorControllerDependencies = {
  readonly registerConnector: (
    registration: ConnectorConfigurationRegistration,
  ) => Promise<ConnectorConfiguration>;
};

/**
 * Handles one register-connector request end to end: composes the
 * path-carried identity and the validated body's own configuration text into
 * one ConnectorConfigurationRegistration and hands it straight to the
 * published registerConnector operation, answering with the registered
 * connector configuration exactly as the registry returns it. Every refusal
 * the registry raises (IncompleteConnectorConfigurationError,
 * ConnectorConfigurationNotWellFormedError) is left to propagate to the
 * app's shared error handler.
 */
export async function handleRegisterConnectorRequest(
  dependencies: RegisterConnectorControllerDependencies,
  params: RegisterConnectorParamsDto,
  body: RegisterConnectorBodyDto,
): Promise<ConnectorConfiguration> {
  return dependencies.registerConnector({ ...params, ...body });
}
