// Maps one validated diagnose request to the diagnose call, and the
// resulting assessment back to the wire response
// (task/http-surface/diagnose-http-endpoint, contracts/investigation/diagnosis):
// transport in, transport out, no business decision of its own — outcome,
// referral and determining_hypothesis are the resolved case's own, and text
// is drafting's own (domain/investigation/assessment). Receives every
// dependency it calls as an interface or a function value (ARC-01); it
// constructs none of them itself (ARC-02) — createDiagnoseHttpServer is
// where every one of them is built. The requester this call runs under is
// exactly request.body.requester: nothing here reads a header, a session or
// any other identity of its own, so there is no authentication or
// authorization surface for SEC-01 to reach. The one refusal this handler
// does raise on its own — a draft-state pinned version — decides nothing
// itself: it names a state the pinned case already carries against the one
// rule that forbids diagnosing it
// (rules/investigation/only-a-released-case-version-is-diagnosed), the same
// way EDG-04 already asks an operation attempted against forbidding state to
// be refused before any write, here before the pipeline this handler calls
// ever starts.
//
// task/case-input-requirements-and-diagnose-gate/refuse-diagnose-missing-required-attribute:
// a second gate now sits right after that released-state check, still ahead
// of runDiagnose — the pinned version's own derived input requirements
// (contracts/knowledge/case-input-requirements, read through the new
// caseInputRequirementsQuery dependency below) are read fresh, and the raw
// subject attribute-value pairs the request carries are held to what they
// name required (subject-covers-case-input-requirements.ts's own
// refuseSubjectMissingRequiredCaseInputs, enforcing
// rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes).
// This gate's own business logic lives entirely in that pure function
// (ARC-04) — this handler only reads the two dependencies it needs and calls
// through, exactly the same shape the released-state check already keeps.

import { randomUUID } from 'node:crypto';
import type { ICaseInputRequirementsQuery } from '../case/case-input-requirements.port.js';
import type { ICaseQuery } from '../case/case-query.port.js';
import { CaseVersionNotReleasedError } from '../errors/case-version-not-released.error.js';
import type { Assessment } from '../investigation/assessment.js';
import { refuseSubjectMissingRequiredCaseInputs } from '../investigation/subject-covers-case-input-requirements.js';
import type { ProductionDiagnoseCall } from '../factories/production-diagnose.factory.js';
import type { DiagnoseRequestDto, DiagnoseResponseDto } from './dto/diagnose.dto.js';

/** Everything the controller needs beyond one request's own body: the published case read, the published case-input-requirements read the new gate consults, the wired production runner, and the two replay-pin values (model, prompt_version) this route's own configuration supplies. */
export type DiagnoseControllerDependencies = {
  readonly caseQuery: ICaseQuery;
  readonly caseInputRequirementsQuery: ICaseInputRequirementsQuery;
  readonly runDiagnose: (call: ProductionDiagnoseCall) => Promise<Assessment>;
  readonly model: string;
  readonly promptVersion: string;
};

/**
 * Handles one diagnose request end to end: reads the pinned case by the
 * request's own slug and version through the published case-query
 * (contracts/knowledge/case-query), refuses before the pipeline ever runs
 * where that version is still in draft state
 * (rules/investigation/only-a-released-case-version-is-diagnosed,
 * scenarios/investigation/a-draft-case-version-refuses-diagnosis), then reads
 * that same pinned version's own derived input requirements through the
 * published case-input-requirements read
 * (contracts/knowledge/case-input-requirements) and refuses where the
 * request's own subject attributes leave any of them missing or empty
 * (rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes,
 * scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute)
 * — collection, judgment and writing all sit behind runDiagnose, so both
 * checks ahead of that call are what keep them from ever starting — assembles
 * the one still-missing ProductionDiagnoseCall fields this route itself
 * owns — a fresh id, the configured model and prompt version — and answers
 * with the resulting Assessment unchanged. cost and durations are no longer
 * assembled here at all (task/investigation-telemetry/diagnose-reports-real-cost-and-durations):
 * ProductionDiagnoseCall no longer declares either field, since runDiagnose's
 * own pipeline now accumulates both itself from what collection, judgment and
 * writing actually did. A request naming no ticket_ref runs the
 * same way as one that supplies it: body.ticket_ref travels through exactly
 * as the request carried it — undefined where none was given — since
 * ProductionDiagnoseCall's own ticket_ref is optional and no node states a
 * placeholder wire representation for its absence
 * (task/case-and-investigation-model/ticket-ref-is-optional).
 */
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
  return dependencies.runDiagnose({
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
}
