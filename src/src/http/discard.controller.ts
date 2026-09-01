import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { DiscardParamsDto } from './dto/discard.dto.js';

export type DiscardControllerDependencies = {
  readonly discard: CaseLifecycleOperations['discard'];
};

export async function handleDiscardRequest(dependencies: DiscardControllerDependencies, params: DiscardParamsDto): Promise<void> {
  await dependencies.discard(params.slug, params.version);
}
