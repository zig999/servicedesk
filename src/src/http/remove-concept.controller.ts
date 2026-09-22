import type { GlossaryService } from '../glossary/glossary.service.js';
import type { RemoveConceptParamsDto } from './dto/remove-concept.dto.js';

export type RemoveConceptControllerDependencies = {
  readonly removeConcept: GlossaryService['removeConcept'];
};

export async function handleRemoveConceptRequest(
  dependencies: RemoveConceptControllerDependencies,
  params: RemoveConceptParamsDto,
): Promise<void> {
  await dependencies.removeConcept(params.name);
}
