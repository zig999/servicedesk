import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { DeleteCaseParamsDto } from './dto/delete-case.dto.js';

export type DeleteCaseControllerDependencies = {
  readonly delete: CaseLifecycleOperations['delete'];
};

export async function handleDeleteCaseRequest(dependencies: DeleteCaseControllerDependencies, params: DeleteCaseParamsDto): Promise<void> {
  await dependencies.delete(params.slug);
}
