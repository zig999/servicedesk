---
title: Frontend surfaces for concept, capability and connector-configuration deletion
summary: The three detail/listing surfaces (glossary concepts panel, capability-detail-screen, connector-configuration-detail-screen), their supporting hooks and services, where a delete control, a second-act confirmation and an outcome disclosure must be added.
area:
  - frontend/app/src/routes
  - frontend/app/src/hooks
  - frontend/app/src/services
sources:
  - work/delete-gaps-ui/intake/scope.md
modules:
  - name: capability-detail-screen
    path: frontend/app/src/routes/capability-detail-screen.tsx
    role: touched
  - name: use-capability-detail
    path: frontend/app/src/hooks/use-capability-detail.ts
    role: touched
  - name: use-capability-detail-view
    path: frontend/app/src/hooks/use-capability-detail-view.ts
    role: touched
  - name: connector-configuration-detail-screen
    path: frontend/app/src/routes/connector-configuration-detail-screen.tsx
    role: touched
  - name: use-connector-configuration-detail
    path: frontend/app/src/hooks/use-connector-configuration-detail.ts
    role: touched
  - name: use-connector-configuration-detail-view
    path: frontend/app/src/hooks/use-connector-configuration-detail-view.ts
    role: touched
  - name: glossary-concepts-panel
    path: frontend/app/src/routes/glossary-concepts-panel.tsx
    role: touched
  - name: use-glossary-concepts
    path: frontend/app/src/hooks/use-glossary-concepts.ts
    role: touched
  - name: error-ui-state
    path: frontend/app/src/services/error-ui-state.ts
    role: depends-on
  - name: api-client
    path: frontend/app/src/services/api-client.ts
    role: depends-on
  - name: route-tree
    path: frontend/app/src/routes/route-tree.tsx
    role: depends-on
  - name: connector-configuration-apply-confirmation-dialog
    path: frontend/app/src/routes/connector-configuration-apply-confirmation-dialog.tsx
    role: adjacent
  - name: discard-confirmation
    path: frontend/app/src/services/discard-confirmation.ts
    role: adjacent
---
## What it is
The scope names three existing single-record surfaces — the glossary's concept row in `glossary-concepts-panel.tsx`, `capability-detail-screen.tsx`, and `connector-configuration-detail-screen.tsx` — each backed by a `use-*-detail`/`use-*-detail-view` hook pair and rendering its actions through `ButtonFooter`.
Deletion is not yet wired anywhere in `frontend/app`: no DELETE call, no confirmation dialog, and no post-delete redirect exist for concepts, capabilities, or connector configurations.
The three surfaces, their hooks, and the two shared services (`api-client.ts`, `error-ui-state.ts`) sit in the same module graph and cannot be treated as separate territories — a change to the error-code map or the API client is felt by all three.

## Notes
`connector-configuration-apply-confirmation-dialog.tsx` already implements a second-explicit-act confirmation using `@tui/ui/dialog` (Cancel + a `variant="destructive"` confirm button) with no name-typing requirement — this is the closer analogue to what the scope asks for than `discard-confirmation.ts`, whose `DiscardControlState` demands typing the slug back and belongs to a different rule (case-version discard).
`error-ui-state.ts`'s `UI_STATE_BY_ERROR_CODE` record does not yet list `ConceptInUseError` or `CapabilityCitedByEvidenceError`; any failure-message helper built on `uiStateForApiError` (the existing pattern is `saveFailureMessage` in `frontend/app/src/hooks/use-capability-form.ts`) will fall through to the generic message until those codes are added.
Success disclosure elsewhere in this codebase uses `toast.success` with a message naming the record acted on (see `capability-create-screen-outcome.spec.ts`), and failure disclosure uses `toast.error` fed by `saveFailureMessage`/`uiStateForApiError`; both mutation hooks (`use-capability-detail.ts`, `use-connector-configuration-detail.ts`) already import `toast` from `sonner` for the save path.
`onCancel` in both `use-capability-detail.ts` and `use-connector-configuration-detail.ts` navigates back via `router.history.canGoBack()` and otherwise falls back to `/capabilities` or `/connectors` respectively — the same shape the scope's "land on the listing" requirement would reuse for a post-delete redirect, though it is duplicated per hook rather than extracted.
`ButtonFooter` (`frontend/app/src/shared/components/button-footer.tsx`) renders a `role="group" aria-label="Actions"` region, portalled via `FooterSlotContext`; every screen's tests locate its action controls through this group.
The glossary's concepts panel renders one row per concept with an inline "Edit" action button already (`toConceptRow` in `glossary-concepts-panel.tsx`); a delete control there is a per-row control, not a screen-level one like the other two surfaces.
`apiFetch` in `api-client.ts` already special-cases a `204` response into `void`, matching a DELETE endpoint's likely response shape.
The backend DELETE routes and their guard errors are stated by the scope as already existing and unchanged; this survey found no frontend code path yet calling them.
