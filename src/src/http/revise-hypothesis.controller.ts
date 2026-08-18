// Maps one validated revise-hypothesis request straight onto the published
// case-lifecycle revise-hypothesis operation (task/case-lifecycle-http/revise-hypothesis-route,
// contracts/knowledge/case-lifecycle): transport in, transport out, no
// business decision of its own — revise-hypothesis.operation.ts's own
// reviseHypothesis already decides every check the specification places
// before any write (a case currently holding no draft, an empty collects, a
// concept the glossary does not hold, a concept refusing the declared
// subject type) and delegates the whole identity-claim and numbering
// decision to the store beneath it, so this controller adds no pre-check and
// no error-mapping logic of its own: the shared status map
// (src/errors/status-map.ts, COR-04) resolves whichever of those the request
// triggers once it reaches error-handler.middleware.ts, exactly as
// create-draft.controller.ts already leaves CaseAlreadyHasDraftError to it.
//
// Receives its one dependency as a narrowed slice of the published
// CaseLifecycleOperations (ARC-01) rather than constructing
// ReviseHypothesisOperation, ICaseStore or IGlossaryQuery itself (ARC-02) —
// case-lifecycle.factory.ts is the one composition root that wires the case
// store and the glossary query together for this operation, and the one true
// wiring surface for every write-route task in this same epic
// (case-lifecycle.factory.ts's own header comment, create-draft.controller.ts's
// own precedent for this exact narrowing).
//
// Answers with the operation's own RevisedHypothesis unchanged — the
// hypothesis name it was asked to revise and the revision number the store's
// own counter assigned — mirroring create-draft.controller.ts's own bare
// pass-through of CreatedDraft rather than reading anything back whole the
// way update-draft.controller.ts and release.controller.ts do for their own
// write routes: revise-hypothesis originates a hypothesis-revision
// independent of any case version's own manifest or release state (this
// task's own REMAINDER note), so there is no case version for a read-after
// -write projection to reuse the way toReadCaseResponse serves those two
// siblings. This is this task's own inference, disclosed in its delivery
// record, since no node names a shape for this operation's own response
// either — the same silence create-draft.operation.ts's own header comment
// already discloses for CreatedDraft.

import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { RevisedHypothesis } from '../case/revise-hypothesis.operation.js';
import type { ReviseHypothesisBodyDto, ReviseHypothesisParamsDto } from './dto/revise-hypothesis.dto.js';

/** Everything the controller needs beyond one request's own path parameter and body: the published case-lifecycle revise-hypothesis operation alone, narrowed from the full CaseLifecycleOperations surface (ARC-01). */
export type ReviseHypothesisControllerDependencies = {
  readonly reviseHypothesis: CaseLifecycleOperations['reviseHypothesis'];
};

/**
 * Handles one revise-hypothesis request end to end: combines the path's own
 * :slug with the validated body into the operation's own ReviseHypothesisInput
 * and hands it straight to the published reviseHypothesis operation,
 * answering with the resulting RevisedHypothesis unchanged. A case currently
 * holding no draft (CaseHoldsNoDraftError), an empty collects
 * (HypothesisRevisionCollectsNoConceptError), a concept the glossary does
 * not hold (ConceptNotInGlossaryError) or one refusing the declared subject
 * type (ConceptRefusesSubjectTypeError) is left to propagate from
 * dependencies.reviseHypothesis, reaching the app's shared error handler
 * before this controller ever inspects it.
 */
export async function handleReviseHypothesisRequest(
  dependencies: ReviseHypothesisControllerDependencies,
  params: ReviseHypothesisParamsDto,
  body: ReviseHypothesisBodyDto,
): Promise<RevisedHypothesis> {
  return dependencies.reviseHypothesis({ slug: params.slug, ...body });
}
