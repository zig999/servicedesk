import type { ICaseQuery } from '../case/case-query.port.js';
import type { ICaseStore } from '../case/case-store.port.js';
import type { ReadCaseResponseDto } from './dto/read-case.dto.js';
import type { UpdateDraftBodyDto, UpdateDraftParamsDto } from './dto/update-draft.dto.js';
import { toReadCaseResponse } from './read-case.controller.js';

export type UpdateDraftControllerDependencies = {
  readonly caseStore: ICaseStore;
  readonly caseQuery: ICaseQuery;
};

export async function handleUpdateDraftRequest(
  dependencies: UpdateDraftControllerDependencies,
  params: UpdateDraftParamsDto,
  body: UpdateDraftBodyDto,
): Promise<ReadCaseResponseDto> {
  await dependencies.caseStore.updateDraft(params.slug, params.version, body);
  const { case: theCase } = await dependencies.caseQuery.readCase(params.slug, params.version);
  return toReadCaseResponse(theCase);
}
