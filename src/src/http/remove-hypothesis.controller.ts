// Maps one validated remove-hypothesis request to the published
// case-lifecycle remove-hypothesis operation (task/case-lifecycle-http/remove-hypothesis-route,
// contracts/knowledge/case-lifecycle): transport in, no transport out — no
// business decision of its own — manifest-composition.operations.ts's own
// removeHypothesis already reads the named version's own current state
// first, refuses through CaseNotFoundError where the slug/version is not
// stored at all, refuses through CaseVersionNotDraftError where its state is
// not draft (rules/knowledge/a-case-version-is-written-once), and refuses
// through ManifestWouldHoldNoHypothesisError where removing the named entry
// would leave the manifest holding no hypothesis
// (rules/knowledge/a-case-has-at-least-one-hypothesis) — every refusal
// checked before the store's own removeManifestEntry() primitive is ever
// reached — so this controller adds no error-mapping logic of its own: the
// shared status map (src/errors/status-map.ts, COR-04) resolves each once it
// reaches error-handler.middleware.ts, exactly as discard.controller.ts
// already leaves its own propagated errors to it.
//
// Receives its one dependency as a narrowed slice of CaseLifecycleOperations
// (ARC-01) — just the removeHypothesis function, not the whole operations
// surface — and constructs nothing itself (ARC-02): the composition root
// that wires CaseLifecycleOperations for this route is whichever factory
// eventually wires this route into the running app
// (task/case-lifecycle-http/register-routes-in-build-app, not this task's
// own concern).
//
// Mirrors discard.controller.ts's own empty-answer convention exactly: this
// task's own criterion 1 answers "with no content" rather than a projected
// wire shape, and removeHypothesis itself answers void — so there is nothing
// here to project onto a response DTO, unlike toReadCaseResponse's own reuse
// in update-draft.controller.ts and release.controller.ts.

import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { RemoveHypothesisParamsDto } from './dto/remove-hypothesis.dto.js';

/** Everything the controller needs beyond one request's own path parameters: a narrowed slice of the published case-lifecycle operations (ARC-01) — just the removeHypothesis function, never the whole CaseLifecycleOperations surface. */
export type RemoveHypothesisControllerDependencies = {
  readonly removeHypothesis: CaseLifecycleOperations['removeHypothesis'];
};

/**
 * Handles one remove-hypothesis request end to end: removes the named
 * manifest entry from the named draft version through the published
 * case-lifecycle remove-hypothesis operation. Answers nothing — there is no
 * read-after-write here (unlike update-draft's and release's own
 * controllers), since this task's own criterion 1 requires no content in the
 * response. A version not in draft state (CaseVersionNotDraftError), a
 * slug/version nothing stores (CaseNotFoundError), or a removal that would
 * leave the manifest holding no hypothesis (ManifestWouldHoldNoHypothesisError)
 * is left to propagate from dependencies.removeHypothesis, reaching the
 * app's shared error handler.
 */
export async function handleRemoveHypothesisRequest(
  dependencies: RemoveHypothesisControllerDependencies,
  params: RemoveHypothesisParamsDto,
): Promise<void> {
  await dependencies.removeHypothesis(params);
}
