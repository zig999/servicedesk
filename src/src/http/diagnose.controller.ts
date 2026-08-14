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
// authorization surface for SEC-01 to reach.

import { randomUUID } from 'node:crypto';
import type { ICaseQuery } from '../case/case-query.port.js';
import type { Assessment } from '../investigation/assessment.js';
import type { Cost } from '../investigation/cost.js';
import type { Durations } from '../investigation/durations.js';
import type { ProductionDiagnoseCall } from '../factories/production-diagnose.factory.js';
import type { DiagnoseRequestDto, DiagnoseResponseDto } from './dto/diagnose.dto.js';

/**
 * Neither IHypothesisEvaluator, IAssessmentConsolidator nor IObservationSource
 * reports a token count, a call count or a stage timing today
 * (run-diagnosis.ts's own "no port this composition calls... reports a
 * token count or a call count" / "this composition never reads the system
 * clock, so it has no way to measure it itself") — accumulating either is
 * explicitly outside whichever task eventually adds it (cost.ts's and
 * durations.ts's own module comments), and every existing caller of this
 * pipeline already supplies an arbitrary placeholder rather than a measured
 * figure. This route supplies the same kind of placeholder, at zero rather
 * than an arbitrary positive figure, since nothing here has measured anything.
 */
const UNMEASURED_COST: Cost = { calls: 0, input_tokens: 0, output_tokens: 0 };
const UNMEASURED_DURATIONS: Durations = { collection: 0, judgment: 0, writing: 0, total: 0 };

/** Everything the controller needs beyond one request's own body: the published case read, the wired production runner, and the two replay-pin values (model, prompt_version) this route's own configuration supplies. */
export type DiagnoseControllerDependencies = {
  readonly caseQuery: ICaseQuery;
  readonly runDiagnose: (call: ProductionDiagnoseCall) => Promise<Assessment>;
  readonly model: string;
  readonly promptVersion: string;
};

/**
 * Handles one diagnose request end to end: reads the pinned case by the
 * request's own slug and version through the published case-query
 * (contracts/knowledge/case-query), assembles the one still-missing
 * ProductionDiagnoseCall fields this route itself owns — a fresh id, the
 * configured model and prompt version, and the not-yet-measured cost/duration
 * placeholders above — and answers with the resulting Assessment unchanged.
 * A request naming no ticket_ref runs the same way as one that supplies it:
 * body.ticket_ref travels through exactly as the request carried it —
 * undefined where none was given — since ProductionDiagnoseCall's own
 * ticket_ref is optional and no node states a placeholder wire
 * representation for its absence
 * (task/case-and-investigation-model/ticket-ref-is-optional).
 */
export async function handleDiagnoseRequest(
  dependencies: DiagnoseControllerDependencies,
  body: DiagnoseRequestDto,
): Promise<DiagnoseResponseDto> {
  const { case: pinnedCase } = await dependencies.caseQuery.readCase(body.case.slug, body.case.version);
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
    cost: UNMEASURED_COST,
    durations: UNMEASURED_DURATIONS,
  });
}
