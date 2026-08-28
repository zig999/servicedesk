// Maps one validated simulate-case request to the simulation call, and the
// resulting record back to the wire response
// (task/case-simulation-pipeline/simulate-case-operation,
// contracts/investigation/case-simulation): transport in, transport out, no
// re-decision of what the pipeline already answered — evidence, evaluations,
// resolved outcome, assessment, cost and durations are exactly what
// runSimulate's own record carries. Receives every dependency it calls as an
// interface or a function value (ARC-01); it constructs none of them itself
// (ARC-02) — createDiagnoseHttpServer is where every one of them is built.
// The requester this call runs under is exactly request.body.requester:
// nothing here reads a header, a session or any other identity of its own,
// so there is no authentication or authorization surface for SEC-01 to
// reach. Unlike diagnose.controller.ts, this handler raises no state-based
// refusal of its own: a simulation is open to a case version in either
// state, draft or released
// (scenarios/investigation/a-draft-case-version-is-simulated,
// contracts/investigation/case-simulation's own "open to a case version in
// either state").
//
// The two refusals this handler does raise before ever calling the
// simulation are both reused, not re-decided: buildSubject
// (subject.ts) is the one place
// rules/investigation/a-subject-carries-at-least-one-attribute is enforced,
// and refuseAttributesNotInGlossary (investigation-factory.ts, exported for
// this reuse) is the one place
// rules/investigation/a-subject-attribute-is-drawn-from-the-glossary is
// enforced — the same two functions diagnose's own composition already
// calls (buildInvestigation), applying the same rule diagnose applies. They
// run here, ahead of the call to runSimulate, rather than after it the way
// diagnose's own buildInvestigation checks them: simulate.factory.ts's own
// createSimulationRunner calls only runInvestigationPipeline and never
// buildInvestigation, so there is no later stage of this composition left to
// apply either check at all — running them first also spares a
// glossary-violating or attribute-empty request the cost of a whole
// collection/judgment/consolidation run that would be refused after paying
// for it (this task's own disclosed inference).

import type { ICaseQuery } from '../case/case-query.port.js';
import type { ProductionSimulationCall } from '../factories/production-simulate.factory.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { refuseAttributesNotInGlossary } from '../investigation/investigation-factory.js';
import type { InvestigationPipelineResult } from '../investigation/investigation-pipeline.js';
import { buildSubject } from '../investigation/subject.js';
import type { SimulateCaseRequestDto, SimulateCaseResponseDto } from './dto/simulate-case.dto.js';

/** Everything the controller needs beyond one request's own body: the published case read, the published glossary read the subject's attributes are checked against, and the wired production simulation runner. */
export type SimulateCaseControllerDependencies = {
  readonly caseQuery: ICaseQuery;
  readonly glossary: IGlossaryQuery;
  readonly runSimulate: (call: ProductionSimulationCall) => Promise<InvestigationPipelineResult>;
};

/**
 * Handles one simulate-case request end to end: reads the pinned case by the
 * request's own slug and version through the published case-query
 * (contracts/knowledge/case-query, reusing case-query's own errors —
 * CaseNotFoundError, CaseNotValidError — for an unknown slug or version, or
 * an incoherent one), refuses before the pipeline ever runs where the
 * subject carries no attribute-value at all or names an attribute the
 * glossary does not hold, and otherwise calls runSimulate and answers its
 * whole record unchanged — evidence, evaluations, resolved, assessment, cost
 * and durations — carrying no narrative and no ticket reference field,
 * since none of these six ever did.
 */
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
