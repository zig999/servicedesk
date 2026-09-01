import type { Case } from '../case/case.js';
import type { ICaseQuery } from '../case/case-query.port.js';
import type { ReadCaseParamsDto, ReadCaseResponseDto } from './dto/read-case.dto.js';

export type ReadCaseControllerDependencies = {
  readonly caseQuery: ICaseQuery;
};

export async function handleReadCaseRequest(
  dependencies: ReadCaseControllerDependencies,
  params: ReadCaseParamsDto,
): Promise<ReadCaseResponseDto> {
  const { case: theCase } = await dependencies.caseQuery.readCase(params.slug, params.version);
  return toReadCaseResponse(theCase);
}

export function toReadCaseResponse(theCase: Case): ReadCaseResponseDto {
  return {
    slug: theCase.slug,
    title: theCase.title,
    when_to_use: theCase.when_to_use,
    version: theCase.version,
    authored_at: theCase.authored_at,
    subject: theCase.subject,
    fallback: theCase.fallback,
    ...(theCase.consolidation_register !== undefined ? { consolidation_register: theCase.consolidation_register } : {}),
    state: theCase.state,
    ...(theCase.released_at !== undefined ? { released_at: theCase.released_at } : {}),
    manifest: theCase.manifest,
  };
}
