// Maps one validated simulate-hypothesis request to the simulation call, and
// the resulting record back to the wire response
// (task/case-simulation-pipeline/simulate-hypothesis-operation,
// contracts/investigation/case-simulation): transport in, transport out, no
// re-decision of what the pipeline already answered — evidence, evaluation
// and durations are exactly what runSimulateHypothesis's own record carries.
// Receives every dependency it calls as an interface or a function value
// (ARC-01); it constructs none of them itself (ARC-02) —
// createDiagnoseHttpServer is where every one of them is built. The
// requester this call runs under is exactly request.body.requester: nothing
// here reads a header, a session or any other identity of its own, so there
// is no authentication or authorization surface for SEC-01 to reach. Like
// simulate-case.controller.ts, this handler raises no state-based refusal of
// its own: a simulation is open to a case version in either state, draft or
// released (contracts/investigation/case-simulation's own "open to a case
// version in either state").
//
// The two subject refusals this handler raises before ever calling the
// simulation are both reused, not re-decided — the identical convention
// simulate-case.controller.ts already keeps: buildSubject (subject.ts) is
// the one place
// rules/investigation/a-subject-carries-at-least-one-attribute is enforced,
// and refuseAttributesNotInGlossary (investigation-factory.ts) is the one
// place rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
// is enforced. Both run here, ahead of the call to runSimulateHypothesis,
// since this composition never reaches buildInvestigation either. The third
// refusal this operation carries — a hypothesis name absent from the pinned
// case version's manifest
// (rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused)
// — is raised inside runSimulateHypothesis itself, through
// case-resolution.ts's own manifestEntryNamed, before either stage runs; this
// handler does not re-check it and lets HypothesisNotInManifestError
// propagate unchanged, the same no-try/catch convention it already keeps for
// CaseNotFoundError and CaseNotValidError below.

import type { ICaseQuery } from '../case/case-query.port.js';
import type { ProductionHypothesisSimulationCall } from '../factories/production-simulate-hypothesis.factory.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { refuseAttributesNotInGlossary } from '../investigation/investigation-factory.js';
import type { SimulateHypothesisPipelineResult } from '../investigation/simulate-hypothesis-pipeline.js';
import { buildSubject } from '../investigation/subject.js';
import type { SimulateHypothesisRequestDto, SimulateHypothesisResponseDto } from './dto/simulate-hypothesis.dto.js';

/** Everything the controller needs beyond one request's own body: the published case read, the published glossary read the subject's attributes are checked against, and the wired production hypothesis-simulation runner. */
export type SimulateHypothesisControllerDependencies = {
  readonly caseQuery: ICaseQuery;
  readonly glossary: IGlossaryQuery;
  readonly runSimulateHypothesis: (call: ProductionHypothesisSimulationCall) => Promise<SimulateHypothesisPipelineResult>;
};

/**
 * Handles one simulate-hypothesis request end to end: reads the pinned case
 * by the request's own slug and version through the published case-query
 * (contracts/knowledge/case-query, reusing case-query's own errors —
 * CaseNotFoundError, CaseNotValidError — for an unknown slug or version, or
 * an incoherent one), refuses before the pipeline ever runs where the
 * subject carries no attribute-value at all or names an attribute the
 * glossary does not hold, and otherwise calls runSimulateHypothesis and
 * answers its whole record unchanged — evidence, evaluation and durations —
 * carrying no resolved outcome, no assessment, no narrative and no ticket
 * reference field, since none of these four is ever produced.
 */
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
