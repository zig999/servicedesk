// Maps one validated register-capability request to the published
// registerCapability call, and the resulting Capability back to the wire
// response (task/capability-authoring/register-capability-route,
// contracts/integration/capability-registry): transport in, transport out,
// no business decision of its own — capability-registry.service.ts's own
// registerCapability already decides the contract-completeness,
// well-formed-schema, read-only-nature and one-concept-one-capability
// refusals (rules/integration/a-capability-declares-its-contract,
// rules/integration/a-capability-declares-well-formed-schemas,
// rules/integration/a-capability-is-read-only,
// rules/integration/one-capability-answers-one-concept) and the
// replace-in-place-by-(name,version) holding, so this controller adds no
// pre-check and no error-mapping logic of its own: the shared status map
// (src/errors/status-map.ts, COR-04) resolves every one of those typed
// errors once it reaches error-handler.middleware.ts.
//
// Receives its one dependency as a plain function type (ARC-01) — the
// registerCapability operation alone — rather than constructing
// CapabilityRegistryService or its store itself (ARC-02):
// build-app.factory.ts's own composeResources is the one composition root
// that wires it, the same way create-draft.controller.ts's own
// CreateDraftControllerDependencies narrows CaseLifecycleOperations to just
// the one operation it needs.

import type { Capability, CapabilityRegistration } from '../capability-registry/capability.js';
import type { RegisterCapabilityBodyDto, RegisterCapabilityParamsDto } from './dto/register-capability.dto.js';

/** Everything the controller needs beyond one request's own path and body: the registerCapability operation alone. */
export type RegisterCapabilityControllerDependencies = {
  readonly registerCapability: (registration: CapabilityRegistration) => Promise<Capability>;
};

/**
 * Handles one register-capability request end to end: composes the
 * path-carried identity and the validated body into one
 * CapabilityRegistration and hands it straight to the published
 * registerCapability operation, answering with the held capability's whole
 * declared contract exactly as the registry returns it. Every refusal the
 * registry raises (IncompleteCapabilityContractError,
 * CapabilitySchemaNotWellFormedError, CapabilityNotReadOnlyError,
 * ConceptAlreadyAnsweredError) is left to propagate to the app's shared
 * error handler.
 */
export async function handleRegisterCapabilityRequest(
  dependencies: RegisterCapabilityControllerDependencies,
  params: RegisterCapabilityParamsDto,
  body: RegisterCapabilityBodyDto,
): Promise<Capability> {
  return dependencies.registerCapability({ ...params, ...body });
}
