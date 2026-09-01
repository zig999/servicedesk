import type { ICaseInputRequirementsQuery } from '../case/case-input-requirements.port.js';
import type { CaseInputRequirementsParamsDto, CaseInputRequirementsResponseDto } from './dto/case-input-requirements.dto.js';

export type CaseInputRequirementsControllerDependencies = {
  readonly caseInputRequirementsQuery: ICaseInputRequirementsQuery;
};

export async function handleReadCaseInputRequirementsRequest(
  dependencies: CaseInputRequirementsControllerDependencies,
  params: CaseInputRequirementsParamsDto,
): Promise<CaseInputRequirementsResponseDto> {
  const result = await dependencies.caseInputRequirementsQuery.readCaseInputRequirements(params.slug, params.version);
  return {
    requirements: result.requirements,
    capabilities_with_malformed_input_schema: result.capabilities_with_malformed_input_schema,
  };
}
