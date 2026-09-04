import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { ReleaseHypothesisRevisionParamsDto } from './dto/release-hypothesis-revision.dto.js';

export type ReleaseHypothesisRevisionControllerDependencies = {
  readonly releaseHypothesisRevision: CaseLifecycleOperations['releaseHypothesisRevision'];
};

export async function handleReleaseHypothesisRevisionRequest(
  dependencies: ReleaseHypothesisRevisionControllerDependencies,
  params: ReleaseHypothesisRevisionParamsDto,
): Promise<void> {
  await dependencies.releaseHypothesisRevision(params.slug, params.name, params.revision);
}
