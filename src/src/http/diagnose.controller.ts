import { randomUUID } from 'node:crypto';
import type { ICaseInputRequirementsQuery } from '../case/case-input-requirements.port.js';
import type { ICaseQuery } from '../case/case-query.port.js';
import { CaseVersionNotReleasedError } from '../errors/case-version-not-released.error.js';
import type { Assessment } from '../investigation/assessment.js';
import { refuseSubjectMissingRequiredCaseInputs } from '../investigation/subject-covers-case-input-requirements.js';
import type { ProductionDiagnoseCall } from '../factories/production-diagnose.factory.js';
import type { DiagnoseRequestDto, DiagnoseResponseDto } from './dto/diagnose.dto.js';

export type DiagnoseControllerDependencies = {
  readonly caseQuery: ICaseQuery;
  readonly caseInputRequirementsQuery: ICaseInputRequirementsQuery;
  readonly runDiagnose: (call: ProductionDiagnoseCall) => Promise<Assessment>;
  readonly model: string;
  readonly promptVersion: string;
};

export async function handleDiagnoseRequest(
  dependencies: DiagnoseControllerDependencies,
  body: DiagnoseRequestDto,
): Promise<DiagnoseResponseDto> {
  const { case: pinnedCase } = await dependencies.caseQuery.readCase(body.case.slug, body.case.version);
  if (pinnedCase.state !== 'released') {
    throw new CaseVersionNotReleasedError(pinnedCase.slug, pinnedCase.version, pinnedCase.state);
  }
  const { requirements } = await dependencies.caseInputRequirementsQuery.readCaseInputRequirements(
    pinnedCase.slug,
    pinnedCase.version,
  );
  refuseSubjectMissingRequiredCaseInputs(body.subject.attributes, requirements);
  const assessment = await dependencies.runDiagnose({
    id: randomUUID(),
    requester: body.requester,
    ticket_ref: body.ticket_ref,
    narrative: body.narrative,
    subjectType: body.subject.type,
    subjectAttributes: body.subject.attributes,
    case: pinnedCase,
    prompt_version: dependencies.promptVersion,
    model: dependencies.model,
  });
  return toDiagnoseResponse(assessment);
}

export function toDiagnoseResponse(assessment: Assessment): DiagnoseResponseDto {
  return {
    outcome: assessment.outcome,
    referral: assessment.referral,
    ...(assessment.determining_hypothesis !== undefined ? { determining_hypothesis: assessment.determining_hypothesis } : {}),
    text: assessment.text,
  };
}
