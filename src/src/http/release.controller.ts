import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { ICaseQuery } from '../case/case-query.port.js';
import type { ReadCaseResponseDto } from './dto/read-case.dto.js';
import type { ReleaseParamsDto } from './dto/release.dto.js';
import { toReadCaseResponse } from './read-case.controller.js';

export type ReleaseControllerDependencies = {
  readonly release: CaseLifecycleOperations['release'];
  readonly caseQuery: ICaseQuery;
};

export async function handleReleaseRequest(
  dependencies: ReleaseControllerDependencies,
  params: ReleaseParamsDto,
): Promise<ReadCaseResponseDto> {
  await dependencies.release(params.slug, params.version);
  const { case: theCase } = await dependencies.caseQuery.readCase(params.slug, params.version);
  return toReadCaseResponse(theCase);
}
