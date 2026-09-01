import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { RemoveHypothesisParamsDto } from './dto/remove-hypothesis.dto.js';

export type RemoveHypothesisControllerDependencies = {
  readonly removeHypothesis: CaseLifecycleOperations['removeHypothesis'];
};

export async function handleRemoveHypothesisRequest(
  dependencies: RemoveHypothesisControllerDependencies,
  params: RemoveHypothesisParamsDto,
): Promise<void> {
  await dependencies.removeHypothesis(params);
}
