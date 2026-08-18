// Maps one validated discard request to the published case-lifecycle
// discard operation (task/case-lifecycle-http/discard-route,
// contracts/knowledge/case-lifecycle): transport in, no transport out — no
// business decision of its own — discard.operation.ts's own
// discardCaseVersion already reads the named version's own current state
// first, refuses through CaseNotFoundError where the slug/version is not
// stored at all, and refuses through CaseVersionNotDraftError where its
// state is not draft (rules/knowledge/a-case-version-is-written-once), both
// checked before the store's own discard() primitive is ever reached — so
// this controller adds no error-mapping logic of its own: the shared status
// map (src/errors/status-map.ts, COR-04) resolves each once it reaches
// error-handler.middleware.ts, exactly as update-draft.controller.ts already
// leaves both errors to it.
//
// Receives its one dependency as a narrowed slice of CaseLifecycleOperations
// (ARC-01) — just the discard function, not the whole operations surface —
// and constructs nothing itself (ARC-02): the composition root that wires
// CaseLifecycleOperations for this route is whichever factory eventually
// wires this route into the running app
// (task/case-lifecycle-http/register-routes-in-build-app, not this task's
// own concern).
//
// Unlike update-draft.controller.ts, this controller reads nothing back:
// this task's own criterion 1 answers "with no content" rather than a
// projected wire shape, and discardCaseVersion itself answers void — so
// there is nothing here to project onto a response DTO, unlike
// toReadCaseResponse's own reuse in update-draft.controller.ts.

import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { DiscardParamsDto } from './dto/discard.dto.js';

/** Everything the controller needs beyond one request's own path parameters: a narrowed slice of the published case-lifecycle operations (ARC-01) — just the discard function, never the whole CaseLifecycleOperations surface. */
export type DiscardControllerDependencies = {
  readonly discard: CaseLifecycleOperations['discard'];
};

/**
 * Handles one discard request end to end: removes the named draft version
 * through the published case-lifecycle discard operation. Answers nothing —
 * there is no read-after-write here (unlike update-draft's own controller),
 * since this task's own criterion 1 requires no content in the response. A
 * version not in draft state, or a slug/version nothing stores, is left to
 * propagate from dependencies.discard — CaseVersionNotDraftError and
 * CaseNotFoundError respectively — reaching the app's shared error handler.
 */
export async function handleDiscardRequest(dependencies: DiscardControllerDependencies, params: DiscardParamsDto): Promise<void> {
  await dependencies.discard(params.slug, params.version);
}
