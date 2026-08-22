---
title: Manifest Builder reorder and remove
summary: Replaces VersionManifestPlaceholder with a screen that reorders a draft's manifest entries via per-row up/down controls and removes entries, each action an isolated PUT or DELETE against the real endpoint.
rationale: >-
  Cut as its own task, distinct from the hypothesis-authoring form and the Hypotheses tab, because
  its objective -- can a draft's manifest be reordered and pruned -- changes for a different
  reason than either: it never authors a hypothesis's own content and never reads across a case's
  hypotheses independent of one version. It depends on revise-hypothesis-form only for the
  "+ Add hypothesis" trigger's own navigation target, since that route belongs to the shared form
  task and this task is the one consumer that renders a button pointing at it -- the dependency
  records that the route must exist for this task's own criterion to be checkable, not an
  execution order between the two.
objective: A draft's manifest can be reordered via its per-row up/down controls and pruned via its per-row Remove control, each action persisted immediately against the real PUT/DELETE endpoint, with the last-entry removal blocked client-side before it ever reaches the server.
criteria:
  - Visiting an existing draft version's manifest route renders every manifest entry from GET /v1/cases/{slug}/versions/{version}'s own manifest, ordered by its declared position, each showing its own hypothesis name and referenced revision number.
  - The up control is disabled on the entry holding the lowest position, and the down control is disabled on the entry holding the highest position.
  - Clicking an enabled up or down control issues PUT /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name} naming the target position, and a 204 response re-renders the list in the new order.
  - Moving a hypothesis onto a position no other entry currently holds succeeds even though that position belonged to a different entry before the move; landing on a free position is never treated as a collision.
  - A 409 ManifestPositionOccupiedError response to that PUT reverts the attempted move and renders an inline message on the affected row.
  - The Remove control carries the tooltip "A case must keep at least one hypothesis" and is disabled exactly when the manifest holds one entry.
  - Clicking an enabled Remove control issues DELETE /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}, and a 204 response removes that entry from the list.
  - A 422 ManifestWouldHoldNoHypothesisError response to that DELETE reloads the manifest from GET /v1/cases/{slug}/versions/{version} rather than trusting the client's own removed-entry state.
  - A 409 CaseVersionNotDraftError response to either the PUT or the DELETE renders the conflict banner and disables every reorder and remove control on the screen.
  - >-
    "+ Add hypothesis" navigates to the New Hypothesis route for the current case and draft
    version.
implements:
  - domain/knowledge/manifest-entry
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  - rules/knowledge/hypotheses-are-ordered-by-precedence
  - rules/knowledge/a-case-has-at-least-one-hypothesis
  - rules/knowledge/a-case-version-is-written-once
  - contracts/knowledge/case-lifecycle
  - contracts/knowledge/case-query
depends_on:
  - task/manifest-hypothesis-authoring/revise-hypothesis-form
sources:
  - intake/onda-4-scope.md
---

## What it is
The section 2.4 Manifest Builder the scope describes, over the real PUT/DELETE endpoints the scope's own backend-reading confirms.
Reuses the existing ConflictBanner, the TUI tooltip component, and the telemetry hook's already-typed manifestHypothesisPlaced/manifestHypothesisRemoved callables.

## Notes
The up/down-button form (rather than drag-and-drop) is a decision already made in the scope's own material, not this task's to re-decide.
No task here renders the manifest entry's own criterion or collects text; only its hypothesis name and revision number are asserted, since the wave's own material does not confirm the case-version GET response embeds that content and the objective (reorder/remove) does not require it.
