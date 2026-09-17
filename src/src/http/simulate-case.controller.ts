import type { ICaseQuery } from '../case/case-query.port.js';
import type { ProductionSimulationCall } from '../factories/production-simulate.factory.js';
import type { InvestigationPipelineResult } from '../investigation/investigation-pipeline.js';
import { buildSubject } from '../investigation/subject.js';
import type { SimulateCaseRequestDto, SimulateCaseResponseDto } from './dto/simulate-case.dto.js';

export type SimulateCaseControllerDependencies = {
  readonly caseQuery: ICaseQuery;
  readonly runSimulate: (call: ProductionSimulationCall) => Promise<InvestigationPipelineResult>;
};

export async function handleSimulateCaseRequest(
  dependencies: SimulateCaseControllerDependencies,
  body: SimulateCaseRequestDto,
): Promise<SimulateCaseResponseDto> {
  const { case: pinnedCase } = await dependencies.caseQuery.readCase(body.case.slug, body.case.version);
  buildSubject(body.subject.type, body.subject.attributes);
  const { evidence, evaluations, resolved, assessment, cost, durations } = await dependencies.runSimulate({
    subjectType: body.subject.type,
    subjectAttributes: body.subject.attributes,
    case: pinnedCase,
    requester: body.requester,
  });
  return { evidence, evaluations, resolved, assessment, cost, durations };
}
