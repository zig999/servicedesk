import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { RevisedHypothesis } from '../case/revise-hypothesis.operation.js';
import type { ReviseHypothesisBodyDto, ReviseHypothesisParamsDto } from './dto/revise-hypothesis.dto.js';

export type ReviseHypothesisControllerDependencies = {
  readonly reviseHypothesis: CaseLifecycleOperations['reviseHypothesis'];
};

export async function handleReviseHypothesisRequest(
  dependencies: ReviseHypothesisControllerDependencies,
  params: ReviseHypothesisParamsDto,
  body: ReviseHypothesisBodyDto,
): Promise<RevisedHypothesis> {
  return dependencies.reviseHypothesis({ slug: params.slug, ...body });
}
