import type { Concept, ConceptRegistration } from '../glossary/terms.js';
import type { RegisterConceptBodyDto, RegisterConceptParamsDto } from './dto/register-concept.dto.js';

export type RegisterConceptControllerDependencies = {
  readonly registerConcept: (registration: ConceptRegistration) => Promise<Concept>;
};

export async function handleRegisterConceptRequest(
  dependencies: RegisterConceptControllerDependencies,
  params: RegisterConceptParamsDto,
  body: RegisterConceptBodyDto,
): Promise<Concept> {
  return dependencies.registerConcept({ ...params, ...body });
}
