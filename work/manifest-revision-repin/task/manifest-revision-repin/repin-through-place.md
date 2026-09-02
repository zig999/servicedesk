---
title: Repinning one manifest entry to a chosen revision
summary: The write path that sends a chosen revision and the row's unchanged position to the existing
  manifest place endpoint, and how its success and its refusals are answered.
rationale: Cut apart from the control that offers the choice because the write path and the cell that
  renders it change for different reasons and meet at one seam — the action the cell invokes. The scope
  stated the endpoint, the unchanged position and the reuse of the existing conflict and toast handling;
  that the write path is its own deliverable, and that a repin must not be signalled as a move, are decided
  here.
sources:
- intake/scope.md
objective: Choosing a revision for an already-manifested hypothesis repins that manifest entry to the
  chosen revision through the existing place operation, leaving the entry at the position it already held.
criteria:
- Repinning a row issues exactly one PUT to /v1/cases/:slug/versions/:version/manifest/:hypothesisName,
  carrying the chosen revision and a position.
- The position that request carries is the row's own position as it stood before the repin, unchanged.
- The revision that request carries is the chosen revision's own number, as the revisions listing answered
  it.
- After a successful repin, every manifest entry's position reads exactly as it did before the repin.
- After a successful repin, the only manifest fact that differs is the repinned entry's referenced revision.
- A successful repin re-reads the case version's manifest from the server rather than patching the shown
  row in place.
- A successful repin does not invalidate the hypothesis-revisions listing.
- A repin answered with HTTP 409 CaseVersionNotDraftError puts the screen into the same blocked state
  the existing ConflictBanner reads.
- A repin answered with HTTP 409 CaseVersionNotDraftError leaves the shown manifest reading exactly as
  it did before the attempt.
- A repin failing for any other reason raises the existing generic-failure toast that the move actions
  already raise.
- A repin's own failure is reported against the row it was attempted on, and its message names the revision
  change rather than a move of the entry.
- The success signal a repin emits does not report the entry as having moved.
implements:
- contracts/knowledge/case-lifecycle
- contracts/knowledge/case-query
- domain/knowledge/case-version
- domain/knowledge/manifest-entry
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-case-version-is-written-once
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case
- rules/knowledge/hypotheses-are-ordered-by-precedence
- constraints/a-case-is-read-whole
---

## What it is
One repin action over an already-manifested hypothesis, sending the chosen revision with the row's own position to the endpoint that already accepts both.
Its success re-reads the manifest; its refusals land in the blocked state and the toast the move actions already use, reported as a revision change rather than as a move.

## Notes
REMAINDER, from the specification — rules/knowledge/a-hypothesis-position-is-unique-within-its-case's ManifestPositionOccupiedError refusal cannot arise from this operation, since a repin sends the row's own unchanged position. Belongs: the task implementing the manifest move/place-at-a-new-position actions.
REMAINDER, from the specification — rules/knowledge/a-case-version-is-written-once's "revising a case's content composes the next draft version instead" reaches no criterion here; a repin never composes a version. Belongs: the task implementing create-draft / starting the next draft of a released version.
REMAINDER, from the specification — rules/knowledge/a-case-version-moves-through-its-declared-lifecycle's release transition and CaseVersionNotDraftAtReleaseError reach no criterion here; only the CaseVersionNotDraftError refusal does. Belongs: the task implementing the release action.
REMAINDER, from the specification — constraints/a-case-is-read-whole's whole-transaction assembly for diagnosis reaches no criterion here; only its permission for independent manifest-entry writes does. Belongs: the diagnosis/case-read act — the engine's read of a pinned case version.
ADVISORY, from the specification — rules/knowledge/validation-runs-at-every-read means a repin the server accepts can still leave the draft not reading back as a case at all if a validator rule no longer holds; criteria 4-6 state nothing for that outcome and an implementation showing pre-repin rows, an empty manifest or an error there satisfies all three as written.
ADVISORY, from the specification — criterion 1 names a concrete HTTP method and route; no candidate states any route or method, only the place-hypothesis and read-case/list-hypothesis-revisions operations, so the executor reads the route from the delivered backend surface rather than from a named node.
ADVISORY, from the specification — criteria 8, 10, 11 and 12 name existing frontend surfaces (the ConflictBanner, the generic-failure toast, attribution wording); only criterion 8's CaseVersionNotDraftError refusal is held by a candidate, and what a curator is told for any other failure, and how a repin's own message is worded, is left to the frontend's own copy, the same way this specification elsewhere leaves a disclosure's exact wording to the frontend rather than fixing it in a node.
