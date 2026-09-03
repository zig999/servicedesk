---
title: Refuse altering a revision from its own state
summary: The schema condition that refuses an alteration of a hypothesis-revision's stored content exactly
  when that revision's own state is released.
rationale: The planning cut this from the column that carries the state because the two change for different
  reasons — the column answers to the declared model, this condition answers to the immutability invariant
  — and because the condition is falsifiable on its own, by attempting an alteration against a row in each
  state.
sources:
- work/hipotese-release-proprio/intake/scope.md
objective: An attempt to alter a stored hypothesis-revision's content is refused exactly when that revision's
  own state is released.
criteria:
- An attempt to alter a stored hypothesis-revision whose own state is released is refused at the point
  of the attempt, reporting a ReleasedHypothesisRevisionNotAlterableError.
- An attempt to alter a stored hypothesis-revision whose own state is draft is not refused by this rule,
  even where a case version in released state references that revision.
- A hypothesis-revision whose own state is released and which no case version's manifest has ever referenced
  is refused alteration the same way.
- The condition the refusal fires on names the hypothesis-revision row's own state and reads no case version
  relation and no manifest relation.
- The collects of a hypothesis-revision whose own state is released read back unchanged after an attempt
  to remove them.
- The collects of a hypothesis-revision whose own state is draft may still be removed, even where a case
  version in released state references that revision.
depends_on:
- task/hypothesis-revision-own-state/store-the-revisions-own-state
implements:
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-schema-replays-from-its-scripts
---

## What it is

The schema's own guarantee that released content never moves, read from the revision's own state instead
of from a join to the case versions that reference it.
It replaces the condition the current trigger fires on, which refuses an update only once some released
case version happens to reference the row.

## Notes

A revision released with no case version ever referencing it stays editable while the current condition stands, which is the gap this task closes.
UNDERDETERMINED, from the specification — `rules/knowledge/a-released-hypothesis-revision-is-never-altered` states the refusal as "an HTTP 409 response reporting a ReleasedHypothesisRevisionNotAlterableError"; no criterion names the HTTP status, only the error. A schema-level guard whose failure surfaces as a raw database error or HTTP 500 naming ReleasedHypothesisRevisionNotAlterableError satisfies every criterion as written while the specification refuses it, because the rule requires the refusal arrive as an HTTP 409 response.
REMAINDER, from the specification — `rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased`'s own routing clauses (replace in place / create next / revision 1 for a hypothesis with none) reach no criterion here; this task's criteria mention a draft revision only to say this rule's refusal does not fire on one, never where a revise's write lands. Belongs to the sibling task `overwrite-only-while-the-revision-is-draft`.
REMAINDER, from the specification — `rules/knowledge/a-revise-answers-the-revision-number-it-saved`'s statement (the curator is told the revision number saved, in both branches, with no field distinguishing them) reaches no criterion here. Belongs to the sibling task `overwrite-only-while-the-revision-is-draft`.
REMAINDER, from the specification — `rules/knowledge/a-hypothesis-revision-number-is-never-reused`'s statement (first revision numbered 1, each later one exactly one past the highest, never reused) reaches no criterion here. Belongs to the sibling task `overwrite-only-while-the-revision-is-draft`.
ADVISORY, from the specification — criteria 2 and 6 both qualify the draft case with "even where a case version in released state references that revision." That given state is unreachable once `rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions` (case-version-release-gate epic) and the one-way hypothesis-revision-state lifecycle both hold: a released version's entries were all released at release time, and a revision never returns to draft. The clause stays demonstrable only by constructing the pairing directly against the schema, below the rule that forbids it in the delivered system.
Decision, beyond the covers — stand: the qualifier documents that this task's own refusal condition does not depend on any case version's state at all — the point of the whole task — and is proven directly against the schema; it needs no claim on `rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions` itself.
ADVISORY, from the specification — `rules/knowledge/a-revise-answers-the-revision-number-it-saved`'s own Description still narrates the old mechanism ("whether any case version in released state references that highest revision", "the cross-aggregate reading a-hypothesis-revision-is-overwritten-while-unreleased already makes") that rule's own statement no longer makes after this increment's `/analyse`. This is stale prose in a neighbouring candidate's Description, not a statement, so it binds nothing here — flagged for a follow-up `/analyse` correction rather than fixed by this task.
ADVISORY, from the specification — `scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves`, `scenarios/knowledge/revising-a-released-revision-creates-the-next` and `scenarios/knowledge/a-released-version-keeps-its-original-revision` ground the routing rule and `a-case-version-is-written-once` rather than this refusal; their coverage lands on sibling tasks.
