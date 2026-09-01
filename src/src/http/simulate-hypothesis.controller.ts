import type { ICaseQuery } from '../case/case-query.port.js';
import type { ProductionHypothesisSimulationCall } from '../factories/production-simulate-hypothesis.factory.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { refuseAttributesNotInGlossary } from '../investigation/investigation-factory.js';
import type { SimulateHypothesisPipelineResult } from '../investigation/simulate-hypothesis-pipeline.js';
import { buildSubject } from '../investigation/subject.js';
import type { SimulateHypothesisRequestDto, SimulateHypothesisResponseDto } from './dto/simulate-hypothesis.dto.js';

export type SimulateHypothesisControllerDependencies = {
  readonly caseQuery: ICaseQuery;
  readonly glossary: IGlossaryQuery;
  readonly runSimulateHypothesis: (call: ProductionHypothesisSimulationCall) => Promise<SimulateHypothesisPipelineResult>;
};

export async function handleSimulateHypothesisRequest(
  dependencies: SimulateHypothesisControllerDependencies,
  body: SimulateHypothesisRequestDto,
): Promise<SimulateHypothesisResponseDto> {
  const { case: pinnedCase } = await dependencies.caseQuery.readCase(body.case.slug, body.case.version);
  const subject = buildSubject(body.subject.type, body.subject.attributes);
  await refuseAttributesNotInGlossary(subject, dependencies.glossary);
  const { evidence, evaluation, durations } = await dependencies.runSimulateHypothesis({
    subjectType: body.subject.type,
    subjectAttributes: body.subject.attributes,
    case: pinnedCase,
    requester: body.requester,
    hypothesis: body.hypothesis,
  });
  return { evidence, evaluation, durations };
}
