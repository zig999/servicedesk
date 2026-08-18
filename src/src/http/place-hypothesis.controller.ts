// Maps one validated place-hypothesis request to the published
// place-hypothesis case-lifecycle operation
// (task/case-lifecycle-http/place-hypothesis-route,
// contracts/knowledge/case-lifecycle): transport in, no transport out — no
// business decision of its own — manifest-composition.operations.ts's own
// placeHypothesis already reads the named version's own current state
// first, refuses through CaseNotFoundError where the slug/version is not
// stored at all, refuses through CaseVersionNotDraftError where its state is
// not draft (rules/knowledge/a-case-version-is-written-once), and refuses
// through ManifestPositionOccupiedError where the named position is already
// held by a different hypothesis
// (rules/knowledge/a-hypothesis-position-is-unique-within-its-case), all
// three checked before any write — so this controller adds no error-mapping
// logic of its own: the shared status map (src/errors/status-map.ts, COR-04)
// resolves each once it reaches error-handler.middleware.ts, exactly as
// update-draft.controller.ts and discard.controller.ts already leave their
// own propagated domain refusals to it.
//
// Receives its one dependency as a narrowed slice of CaseLifecycleOperations
// (ARC-01) — just the placeHypothesis function, not the whole operations
// surface, and not ICaseStore directly — and constructs nothing itself
// (ARC-02): the composition root that wires CaseLifecycleOperations for this
// route is whichever factory eventually wires this route into the running
// app (task/case-lifecycle-http/register-routes-in-build-app, not this
// task's own concern).
//
// Unlike update-draft.controller.ts and release.controller.ts, this
// controller reads nothing back: this task's own criterion 1 states only
// that a valid request places the named hypothesis's stated revision at the
// stated position, never that the route answers with a projected wire shape,
// and placeHypothesis itself answers void
// (case-lifecycle.factory.ts's own CaseLifecycleOperations['placeHypothesis']
// signature) — so there is nothing here to project onto a response DTO, the
// same absence of a read-after-write discard.controller.ts's own header
// already reasons through for its own void write. This is this task's own
// inference, disclosed in its delivery record.

import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { PlaceHypothesisBodyDto, PlaceHypothesisParamsDto } from './dto/place-hypothesis.dto.js';

/** Everything the controller needs beyond one request's own path parameters and body: a narrowed slice of the published case-lifecycle operations (ARC-01) — just the placeHypothesis function, never the whole CaseLifecycleOperations surface and never ICaseStore itself. */
export type PlaceHypothesisControllerDependencies = {
  readonly placeHypothesis: CaseLifecycleOperations['placeHypothesis'];
};

/**
 * Handles one place-hypothesis request end to end: adopts the path-named
 * hypothesis's stated revision into the path-named draft version's manifest,
 * at the position the body states, through the published case-lifecycle
 * placeHypothesis operation. Answers nothing — there is no read-after-write
 * here, since this task's own criterion 1 requires no response body. A
 * version not in draft state (CaseVersionNotDraftError), an occupied
 * position (ManifestPositionOccupiedError), or a slug/version nothing stores
 * (CaseNotFoundError) is left to propagate from dependencies.placeHypothesis,
 * reaching the app's shared error handler.
 */
export async function handlePlaceHypothesisRequest(
  dependencies: PlaceHypothesisControllerDependencies,
  params: PlaceHypothesisParamsDto,
  body: PlaceHypothesisBodyDto,
): Promise<void> {
  await dependencies.placeHypothesis({
    slug: params.slug,
    version: params.version,
    hypothesis_name: params.hypothesis_name,
    revision: body.revision,
    position: body.position,
  });
}
