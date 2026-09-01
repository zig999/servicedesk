import type { ICaseQuery } from '../case/case-query.port.js';
import type { ProductionSimulationCall } from '../factories/production-simulate.factory.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { refuseAttributesNotInGlossary } from '../investigation/investigation-factory.js';
import type { InvestigationPipelineResult } from '../investigation/investigation-pipeline.js';
import { buildSubject } from '../investigation/subject.js';
import type { SimulateCaseRequestDto, SimulateCaseResponseDto } from './dto/simulate-case.dto.js';

export type SimulateCaseControllerDependencies = {
  readonly caseQuery: ICaseQuery;
  readonly glossary: IGlossaryQuery;
  readonly runSimulate: (call: ProductionSimulationCall) => Promise<InvestigationPipelineResult>;
};

export async function handleSimulateCaseRequest(
  dependencies: SimulateCaseControllerDependencies,
  body: SimulateCaseRequestDto,
): Promise<SimulateCaseResponseDto> {
  const { case: pinnedCase } = await dependencies.caseQuery.readCase(body.case.slug, body.case.version);
  const subject = buildSubject(body.subject.type, body.subject.attributes);
  await refuseAttributesNotInGlossary(subject, dependencies.glossary);
  const { evidence, evaluations, resolved, assessment, cost, durations } = await dependencies.runSimulate({
    subjectType: body.subject.type,
    subjectAttributes: body.subject.attributes,
    case: pinnedCase,
    requester: body.requester,
  });
  return { evidence, evaluations, resolved, assessment, cost, durations };
}
