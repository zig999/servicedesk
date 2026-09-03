---
title: Decide the revise branch from the revision's own state
summary: The revise-hypothesis branch that chooses replace-in-place or create-next from the highest existing
  revision's own state.
rationale: >-
  The planning kept the narrow state port and the one operation that reads it in a single task —
  the port has exactly one consumer and the change is which fact it answers with, so a task delivering
  the port's new shape alone would state no outcome that could be shown met.
sources:
- work/hipotese-release-proprio/intake/scope.md
objective: revise-hypothesis chooses between replacing a hypothesis's highest existing revision in place
  and creating its next revision from that revision's own state alone.
criteria:
- Revising a hypothesis whose highest existing revision's own state is draft replaces that revision's
  content in place and leaves its number unchanged.
- Revising a hypothesis whose highest existing revision's own state is released creates that hypothesis's
  next revision, in draft state, leaving the released revision's content unchanged.
- Revising a hypothesis whose highest existing revision's own state is released and which no case version's
  manifest references creates the next revision rather than replacing that revision.
- Revising a hypothesis whose highest existing revision's own state is draft replaces that revision in
  place even where a case version in released state references it.
- Revising a hypothesis that holds no revision yet creates revision 1.
- The revise answers the number of the revision it wrote in the replace branch and in the create branch
  alike.
- The revise's answer holds no field whose value differs between the replace branch and the create branch.
- A case version in released state still references the revision its manifest referenced before a later
  revise of the same hypothesis, and that revision's content reads unchanged.
- The port the operation reads the revision's own state through imports no database driver, no HTTP framework
  and no LLM client.
depends_on:
- task/hypothesis-revision-own-state/store-the-revisions-own-state
- task/hypothesis-revision-own-state/refuse-altering-a-released-revision
implements:
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/a-revise-answers-the-revision-number-it-saved
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
- scenarios/knowledge/revising-a-released-revision-creates-the-next
- scenarios/knowledge/a-released-version-keeps-its-original-revision
- constraints/the-domain-depends-on-no-infrastructure
---

## What it is

The curation loop's own branch, moved off the cross-aggregate reading it makes today.
The overwrite decision reads the highest existing revision's own state, so a revision released without
ever being manifested stops being overwritten and a draft revision a released version happens to reference
stops being frozen.

## Notes

The task builds on the schema condition as well as the column: a draft revision a released case version references cannot be replaced in place while the current condition refuses that update.
UNDERDETERMINED, from the specification — `rules/knowledge/a-released-hypothesis-revision-is-never-altered`'s refusal clause ("refused at the point of the attempt with an HTTP 409 response reporting a ReleasedHypothesisRevisionNotAlterableError") reaches no criterion here; the criteria require only that the create branch leaves the released revision's content unchanged, which a silent no-op or silent overwrite on a stale read would also satisfy. The refusal itself is proven by the sibling task `refuse-altering-a-released-revision`, which this task depends on.
ADVISORY, from the specification — `rules/knowledge/a-revise-answers-the-revision-number-it-saved`'s own Description still narrates the superseded branch basis ("whether any case version in released state references that highest revision", "the cross-aggregate reading a-hypothesis-revision-is-overwritten-while-unreleased already makes"), which that rule's own statement no longer makes after this increment's `/analyse`. Flagged for a follow-up `/analyse` correction, not this task's to reword.
ADVISORY, from the specification — criterion 4's premise (a case version in released state referencing a revision whose own state is draft) is a state no release can produce once `rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions` holds, and is demonstrable only over a fixture assembled directly against the schema, below the release operation.
Decision, beyond the covers — stand: the criterion proves this task's own branch reads no case-version fact at all, by construction against the schema; it needs no claim on `rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions` or `rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle`, and no test route through either.
ADVISORY, from the specification — `scenarios/knowledge/a-released-version-keeps-its-original-revision`'s own `given` (a new draft version 2 replacing revision 1 in its manifest, then released) and its `subject` `rules/knowledge/a-case-version-is-written-once` sit outside this epic's covers; criterion 8 answers only the narrower fact that a later revise leaves an already-referenced revision's content unchanged.
Decision, beyond the covers — stand: rules/knowledge/a-case-version-is-written-once's wider manifest-copy and write-once machinery the scenario's `given` sets up is pre-existing, already-delivered behavior this increment does not touch; only the revision-content fact is this task's to prove.
ADVISORY, from the specification — `scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves`' `then` clauses about the draft's manifest entry still pinning the revision and disclosing no higher revision belong to `rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis` and `domain/knowledge/manifest-entry`, outside this epic's covers; criterion 1 answers only the revision's own number and content.
Decision, beyond the covers — stand: rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis and domain/knowledge/manifest-entry's disclosure behavior the scenario also narrates is pre-existing, unaffected by this increment.
ADVISORY, from the specification — `constraints/the-stored-schema-mirrors-the-declared-model` and `constraints/the-schema-replays-from-its-scripts` sit in the epic's covers but reach no criterion of this task; they are the sibling task `store-the-revisions-own-state`'s to answer. `domain/knowledge/hypothesis-revision`'s own `release` operation likewise reaches no criterion here — the state this task reads is moved by `rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle`, outside this epic's covers.
Decision, beyond the covers — stand: this task only reads the revision's own state column; moving it is the `hypothesis-revision-own-release` epic's own task, already a dependency of the sibling gate task and orthogonal to this one.
