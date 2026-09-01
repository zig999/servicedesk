import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { CreatedDraft } from '../case/create-draft.operation.js';
import type { CreateDraftBodyDto } from './dto/create-draft.dto.js';

export type CreateDraftControllerDependencies = {
  readonly createDraft: CaseLifecycleOperations['createDraft'];
};

export async function handleCreateDraftRequest(
  dependencies: CreateDraftControllerDependencies,
  body: CreateDraftBodyDto,
): Promise<CreatedDraft> {
  return dependencies.createDraft(body);
}
