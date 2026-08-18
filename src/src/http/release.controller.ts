// Maps one validated release request to the published case-lifecycle
// release operation, then reads the released version back through
// ICaseQuery (task/case-lifecycle-http/release-route,
// contracts/knowledge/case-lifecycle): transport in, transport out, no
// business decision of its own — release.operation.ts's own release already
// refuses through CaseVersionNotDraftAtReleaseError where the named version
// is not in draft state, checked first, and through
// CaseVersionNotReleasableError naming every violated rule together where
// its assembled manifest fails any structural or coherence rule, checked
// second — and refuses through CaseNotFoundError where the slug/version is
// not stored at all — so this controller adds no error-mapping logic of its
// own: the shared status map (src/errors/status-map.ts, COR-04) resolves
// each once it reaches error-handler.middleware.ts, exactly as
// update-draft.controller.ts already leaves its own domain refusals to it.
//
// Receives both its dependencies as interfaces (ARC-01); constructs neither
// itself (ARC-02) — the composition root that builds the release function
// and ICaseQuery for this route is whichever factory wires this route into
// the running app (task/case-lifecycle-http/register-routes-in-build-app,
// not this task's own concern). The release dependency is narrowed to
// CaseLifecycleOperations['release'] alone (case-lifecycle.factory.ts) — this
// controller never depends on the full CaseLifecycleOperations surface, nor
// on ReleaseOperation, ICaseStore, the glossary or the capability registry
// behind it (ARC-01/ARC-02).
//
// release's own store operation answers void (release.operation.ts's own
// IRelease.release doc comment), never the released version — but this
// task's own criterion 1 requires the route to return the version now in
// released state. This controller reads the version back the same way
// update-draft.controller.ts already does for its own write route — through
// the published ICaseQuery.readCase — once the write has completed without
// refusal, and projects it through the same toReadCaseResponse read-case
// -.controller.ts exports for exactly this reuse (MNT-03), the same
// read-after-write convention update-draft-route established rather than a
// second one invented here. This mirroring is this task's own inference,
// disclosed in its delivery record.

import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { ICaseQuery } from '../case/case-query.port.js';
import type { ReadCaseResponseDto } from './dto/read-case.dto.js';
import type { ReleaseParamsDto } from './dto/release.dto.js';
import { toReadCaseResponse } from './read-case.controller.js';

/** Everything the controller needs beyond one request's own path parameters: the published case-lifecycle release, narrowed to that one function alone, and the published knowledge-context read. */
export type ReleaseControllerDependencies = {
  readonly release: CaseLifecycleOperations['release'];
  readonly caseQuery: ICaseQuery;
};

/**
 * Handles one release request end to end: moves the named draft version to
 * released state through the published case-lifecycle release operation,
 * then answers with the version read back whole through the published
 * case-query read, projected onto the same wire shape read-case-route and
 * update-draft-route already answer with. A version not in draft state
 * (CaseVersionNotDraftAtReleaseError), an unreleasable one
 * (CaseVersionNotReleasableError naming every violated rule together), or a
 * slug/version nothing stores (CaseNotFoundError) is left to propagate from
 * dependencies.release, reaching the app's shared error handler before any
 * read-back is attempted.
 */
export async function handleReleaseRequest(
  dependencies: ReleaseControllerDependencies,
  params: ReleaseParamsDto,
): Promise<ReadCaseResponseDto> {
  await dependencies.release(params.slug, params.version);
  const { case: theCase } = await dependencies.caseQuery.readCase(params.slug, params.version);
  return toReadCaseResponse(theCase);
}
