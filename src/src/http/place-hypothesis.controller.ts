import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { PlaceHypothesisBodyDto, PlaceHypothesisParamsDto } from './dto/place-hypothesis.dto.js';

export type PlaceHypothesisControllerDependencies = {
  readonly placeHypothesis: CaseLifecycleOperations['placeHypothesis'];
};

export async function handlePlaceHypothesisRequest(
  dependencies: PlaceHypothesisControllerDependencies,
  params: PlaceHypothesisParamsDto,
  body: PlaceHypothesisBodyDto,
): Promise<void> {
  await dependencies.placeHypothesis({
    slug: params.slug,
    version: params.version,
    hypothesis_name: params.hypothesis_name,
    revision: body.revision,
    position: body.position,
  });
}
