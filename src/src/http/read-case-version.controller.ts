import type { CaseVersionAttributes, ICaseQuery } from '../case/case-query.port.js';
import type { ReadCaseVersionParamsDto, ReadCaseVersionResponseDto } from './dto/read-case-version.dto.js';

export type ReadCaseVersionControllerDependencies = {
  readonly caseQuery: ICaseQuery;
};

export async function handleReadCaseVersionRequest(
  dependencies: ReadCaseVersionControllerDependencies,
  params: ReadCaseVersionParamsDto,
): Promise<ReadCaseVersionResponseDto> {
  const { version } = await dependencies.caseQuery.readCaseVersion(params.slug, params.version);
  return toReadCaseVersionResponse(version);
}

export function toReadCaseVersionResponse(attributes: CaseVersionAttributes): ReadCaseVersionResponseDto {
  return {
    title: attributes.title,
    when_to_use: attributes.when_to_use,
    subject: attributes.subject,
    fallback: attributes.fallback,
    ...(attributes.consolidation_register !== undefined
      ? { consolidation_register: attributes.consolidation_register }
      : {}),
  };
}
