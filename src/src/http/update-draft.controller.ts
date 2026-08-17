// Maps one validated update-draft request to the published ICaseStore
// write, then reads the corrected version back through ICaseQuery
// (task/case-lifecycle-http/update-draft-route,
// contracts/knowledge/case-lifecycle): transport in, transport out, no
// business decision of its own — case-store.port.ts's own updateDraft
// already reads the named version's own current state first, refuses
// through CaseNotFoundError where the slug/version is not stored at all,
// and refuses through CaseVersionNotDraftError where its state is not draft
// (rules/knowledge/a-case-version-is-written-once), both checked before any
// write is attempted — so this controller adds no error-mapping logic of
// its own: the shared status map (src/errors/status-map.ts, COR-04)
// resolves each once it reaches error-handler.middleware.ts, exactly as
// read-case.controller.ts already leaves CaseNotFoundError to it.
//
// Receives both its dependencies as interfaces (ARC-01); constructs neither
// itself (ARC-02) — the composition root that builds ICaseStore and
// ICaseQuery for this route is whichever factory wires this route into the
// running app (task/case-lifecycle-http/register-routes-in-build-app, not
// this task's own concern).
//
// updateDraft's own store operation answers void (case-store.port.ts's own
// header comment), never the updated version — but this task's own
// criterion 1 requires the route to return the updated version. No write
// route and no established read-after-write convention exists yet anywhere
// in this codebase to mirror (this is the first write route the case
// -lifecycle HTTP surface delivers), so this controller reads the version
// back the same way read-case.controller.ts already does for its own GET —
// through the published ICaseQuery.readCase — once the write has completed
// without refusal. This is this task's own inference, disclosed in its
// delivery record: readCase's own validated whole-case read
// (constraints/a-case-is-read-whole,
// rules/knowledge/validation-runs-at-every-read) is reused rather than a
// second, lighter read invented just for this route, since the wire shape
// this route must answer is identical to read-case-route's own — the case
// version whole, corrected. toReadCaseResponse is imported from
// read-case.controller.ts, exported there for exactly this reuse (MNT-03),
// rather than restated here.

import type { ICaseQuery } from '../case/case-query.port.js';
import type { ICaseStore } from '../case/case-store.port.js';
import type { ReadCaseResponseDto } from './dto/read-case.dto.js';
import type { UpdateDraftBodyDto, UpdateDraftParamsDto } from './dto/update-draft.dto.js';
import { toReadCaseResponse } from './read-case.controller.js';

/** Everything the controller needs beyond one request's own path parameters and body: the published case-lifecycle write and the published knowledge-context read. */
export type UpdateDraftControllerDependencies = {
  readonly caseStore: ICaseStore;
  readonly caseQuery: ICaseQuery;
};

/**
 * Handles one update-draft request end to end: corrects the named draft
 * version's own five declared attributes through the published case-store
 * write, then answers with the version read back whole through the
 * published case-query read, projected onto the same wire shape
 * read-case-route already answers with. A version not in draft state, or a
 * slug/version nothing stores, is left to propagate from
 * dependencies.caseStore.updateDraft — CaseVersionNotDraftError and
 * CaseNotFoundError respectively — reaching the app's shared error handler
 * before any read-back is attempted.
 */
export async function handleUpdateDraftRequest(
  dependencies: UpdateDraftControllerDependencies,
  params: UpdateDraftParamsDto,
  body: UpdateDraftBodyDto,
): Promise<ReadCaseResponseDto> {
  await dependencies.caseStore.updateDraft(params.slug, params.version, body);
  const { case: theCase } = await dependencies.caseQuery.readCase(params.slug, params.version);
  return toReadCaseResponse(theCase);
}
