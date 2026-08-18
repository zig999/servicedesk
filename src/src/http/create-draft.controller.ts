// Maps one validated create-draft request straight onto the published
// case-lifecycle create-draft operation (task/case-lifecycle-http/create-draft-route,
// contracts/knowledge/case-lifecycle): transport in, transport out, no
// business decision of its own — create-draft.operation.ts's own
// createDraft already decides the next version number, the copied-manifest
// source and the at-most-one-draft refusal (raised as CaseAlreadyHasDraftError,
// reused as-is by the store beneath it), so this controller adds no
// pre-check and no error-mapping logic of its own: the shared status map
// (src/errors/status-map.ts, COR-04) resolves CaseAlreadyHasDraftError once
// it reaches error-handler.middleware.ts, exactly as update-draft.controller.ts
// already leaves CaseVersionNotDraftError/CaseNotFoundError to it.
//
// This controller is deliberately a bare pass-through: it must remain
// callable for a slug that already identifies a case with no open draft
// (create-draft still originates that case's own next version then), so it
// adds no "does this slug already exist" read of its own before calling
// createDraft — the very reading this task's own UNDERDETERMINED note rules
// out (case/create-draft.operation.ts's own header comment: "a case already
// holding a version in draft state refuses the second one ... reused as-is,
// since it already names exactly this refusal").
//
// Receives its one dependency as a narrowed slice of the published
// CaseLifecycleOperations (ARC-01) rather than constructing
// CreateDraftOperation or ICaseStore itself (ARC-02) — case-lifecycle.factory.ts
// is the one composition root that wires the case store, and the one true
// wiring surface for every write-route task in this same epic
// (case-lifecycle.factory.ts's own header comment).

import type { CaseLifecycleOperations } from '../factories/case-lifecycle.factory.js';
import type { CreatedDraft } from '../case/create-draft.operation.js';
import type { CreateDraftBodyDto } from './dto/create-draft.dto.js';

/** Everything the controller needs beyond one request's own body: the published case-lifecycle create-draft operation alone, narrowed from the full CaseLifecycleOperations surface (ARC-01). */
export type CreateDraftControllerDependencies = {
  readonly createDraft: CaseLifecycleOperations['createDraft'];
};

/**
 * Handles one create-draft request end to end: hands the validated body
 * straight to the published createDraft operation and answers with the
 * resulting CreatedDraft — the slug it was asked to draft and the version
 * number the case's own durable counter assigned — unchanged. A case
 * already holding an open draft is left to propagate as
 * CaseAlreadyHasDraftError from dependencies.createDraft, reaching the
 * app's shared error handler before this controller ever inspects it.
 */
export async function handleCreateDraftRequest(
  dependencies: CreateDraftControllerDependencies,
  body: CreateDraftBodyDto,
): Promise<CreatedDraft> {
  return dependencies.createDraft(body);
}
