---
title: Discard a draft case version
summary: Adds the "Discard draft" control to the Version Editor, opening an in-place, slug-typed destructive confirmation Dialog that removes the draft and its manifest via DELETE, leaving its hypotheses and their revisions untouched, and lands the curator on Case Detail.
rationale: >-
  Kept separate from release-draft-version for the same reason in reverse: discard is a destructive
  deletion behind its own slug-typed confirmation barrier, shares no validation checklist or
  violations vocabulary with release, and is independently demonstrable without release ever having
  shipped.

  I resolved the epic's own open decision the same way as release-draft-version and for the same
  reasons: an in-place TUI Dialog, following task/manifest-hypothesis-authoring/manifest-builder's
  own Remove flow, rather than navigating to the already-registered
  "/cases/$slug/versions/$version/discard" placeholder route. That route, and
  VersionDiscardPlaceholder behind it, stay exactly as unreachable as the inventory found them; this
  task does not retire them.

  I depend this task on edit-draft-version because the Discard control and its Dialog extend that
  task's own screen and hook rather than building a new surface. The typed-slug barrier is entirely
  client-side per the scope's own finding #4 (the server neither validates nor expects an echoed
  slug), so this task's own criteria hold the barrier to the client's own gating, not to anything the
  DELETE request body carries -- it carries none.
objective: Confirming "Discard draft" on a loaded draft case version, after typing the case's own slug, removes that version and its manifest via one DELETE /v1/cases/{slug}/versions/{version} request and lands the curator on the case's own Case Detail route.
criteria:
  - The Version Editor renders a "Discard draft" control only while the currently loaded version's own state is draft.
  - Clicking "Discard draft" opens an in-place TUI Dialog (no navigation) stating that the case's hypotheses keep their content and that only this draft and its manifest are removed.
  - The Dialog's own "Discard draft" control stays disabled until the curator has typed the case's own slug, exactly, into the confirmation field.
  - Confirming with the slug typed exactly issues one DELETE /v1/cases/{slug}/versions/{version} request with no body.
  - A 204 response to that DELETE navigates the curator to that case's own Case Detail route.
  - Any error response to that DELETE keeps the Dialog open, rendering that error's own message, rather than navigating away.
  - The Dialog's "Keep draft" control closes it without issuing any request.
implements:
  - contracts/knowledge/case-lifecycle
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - rules/knowledge/only-a-draft-case-version-may-be-discarded
depends_on:
  - task/version-editor/edit-draft-version
sources:
  - intake/onda-5-scope.md
---

## What it is
The section 2.7 Discard confirmation the scope describes, over the real DELETE .../versions/{version} endpoint the scope's own backend finding confirms (no request body, 204 on success, 404/409 CaseVersionNotDraftError reused).
The slug-typed confirmation barrier the scope's finding #4 confirms is entirely client-side, never echoed to or checked by the server.
The survival of hypotheses and hypothesis-revisions across a discard, the scope's finding #5 confirms and the wireframe's own copy states verbatim.

## Notes
"/cases/$slug/versions/$version/discard" (VersionDiscardPlaceholder) stays unreachable and unretired by this task, per the epic's own Dialog-in-place decision.
This task reuses use-manifest-builder.ts's own established mutation convention (one isolated useMutation, its own onSuccess/onError branch) rather than inventing a fourth pattern, per the inventory's own Notes.
