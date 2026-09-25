import type { ICaseQuery } from '../case/case-query.port.js';
import type { ICaseStore } from '../case/case-store.port.js';
import type { ReadCaseVersionResponseDto } from './dto/read-case-version.dto.js';
import type { UpdateDraftBodyDto, UpdateDraftParamsDto } from './dto/update-draft.dto.js';
import { toReadCaseVersionResponse } from './read-case-version.controller.js';

export type UpdateDraftControllerDependencies = {
  readonly caseStore: ICaseStore;
  readonly caseQuery: ICaseQuery;
};

export async function handleUpdateDraftRequest(
  dependencies: UpdateDraftControllerDependencies,
  params: UpdateDraftParamsDto,
  body: UpdateDraftBodyDto,
): Promise<ReadCaseVersionResponseDto> {
  await dependencies.caseStore.updateDraft(params.slug, params.version, body);
  const { version } = await dependencies.caseQuery.readCaseVersion(params.slug, params.version);
  return toReadCaseVersionResponse(version);
}
