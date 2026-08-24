// Maps one validated register-concept request to GlossaryService's own
// registerConcept call, and the resulting Concept back to the wire response
// (task/concept-authoring/register-concept-route,
// contracts/glossary/glossary-authoring): transport in, transport out, no
// business decision of its own — GlossaryService.registerConcept already
// decides the create-or-replace-in-place-by-name holding
// (domain/glossary/concept) and the ttl default
// (rules/knowledge/a-collected-concept-declares-a-ttl), so this controller
// adds no pre-check and no error-mapping logic of its own.
//
// Receives its one dependency as a plain function type (ARC-01) — the
// registerConcept operation alone — rather than constructing GlossaryService
// or its store itself (ARC-02): build-app.factory.ts's own composeResources
// is the one composition root that wires it, the same way
// register-capability.controller.ts's own
// RegisterCapabilityControllerDependencies narrows CapabilityRegistryService
// to just the one operation it needs.

import type { Concept, ConceptRegistration } from '../glossary/terms.js';
import type { RegisterConceptBodyDto, RegisterConceptParamsDto } from './dto/register-concept.dto.js';

/** Everything the controller needs beyond one request's own path and body: the registerConcept operation alone. */
export type RegisterConceptControllerDependencies = {
  readonly registerConcept: (registration: ConceptRegistration) => Promise<Concept>;
};

/**
 * Handles one register-concept request end to end: composes the path-carried
 * identity and the validated body into one ConceptRegistration and hands it
 * straight to the published registerConcept operation, answering with the
 * registered concept exactly as the glossary holds it.
 */
export async function handleRegisterConceptRequest(
  dependencies: RegisterConceptControllerDependencies,
  params: RegisterConceptParamsDto,
  body: RegisterConceptBodyDto,
): Promise<Concept> {
  return dependencies.registerConcept({ ...params, ...body });
}
