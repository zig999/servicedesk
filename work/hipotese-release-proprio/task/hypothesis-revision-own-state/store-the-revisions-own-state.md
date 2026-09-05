---
title: Store each hypothesis-revision's own state
summary: The schema and the write path that record a hypothesis-revision's own draft-or-released state on
  its own row.
rationale: The planning cut the column and what writes it as one task because a state column nothing writes
  records nothing falsifiable, and the write path that fills it changes for the same reason the column
  exists.
sources:
- work/hipotese-release-proprio/intake/scope.md
objective: A hypothesis-revision the system stores reads back carrying its own state, and a revision written
  by revise-hypothesis reads back as draft.
criteria:
- Applying every migration script to an empty database in numbered order, with no step performed by hand,
  produces a hypothesis-revision relation holding a state column.
- The state column admits the values draft and released and refuses any other value.
- The state column is not nullable, so every stored hypothesis-revision names exactly one state.
- Every column the migration adds pairs with an attribute domain/knowledge/hypothesis-revision declares.
- A revision revise-hypothesis inserts reads back with its own state draft.
- A revision whose content revise-hypothesis replaces in place reads back with its own state unchanged.
implements:
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-schema-replays-from-its-scripts
- constraints/the-domain-depends-on-no-infrastructure
---

## What it is

The one migration that gives the hypothesis-revision relation a state column of its own, and the insert
path that writes draft into it.
The state a revision stands in stops being computed from the case versions that reference it and becomes
a column of the revision's own row.

## Notes

The scope places migration of existing rows out of plan: the product confirmed the current data may be discarded and recreated.
REMAINDER, from the specification — every clause of `rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased`'s statement (writing into the highest existing revision in place, creating the next revision once released, always creating revision 1 for a hypothesis holding none) reaches no criterion of this task; the two scenarios subject to it (`scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves`, `scenarios/knowledge/revising-a-released-revision-creates-the-next`) go with it. Belongs to the sibling task `overwrite-only-while-the-revision-is-draft`.
REMAINDER, from the specification — both clauses of `rules/knowledge/a-released-hypothesis-revision-is-never-altered`'s statement (never altered again; refused at the point of the attempt with an HTTP 409 response) reach no criterion of this task. Belongs to the sibling task `refuse-altering-a-released-revision`.
REMAINDER, from the specification — the whole statement of `rules/knowledge/a-revise-answers-the-revision-number-it-saved` reaches no criterion of this task; no criterion here reads what revise-hypothesis answers, only the stored row. Belongs to the task implementing the revise-hypothesis operation's own answer.
REMAINDER, from the specification — the clauses of `rules/knowledge/a-hypothesis-revision-number-is-never-reused`'s statement (first revision numbered 1, each later one exactly one past the highest, never reused) reach no criterion of this task; no criterion here assigns or checks a revision number. Belongs to the sibling task `overwrite-only-while-the-revision-is-draft`.
ADVISORY, from the specification — `rules/knowledge/a-revise-answers-the-revision-number-it-saved`'s own Description still bases the overwrite-or-create branch on the pre-decoupling fact ("whether any case version in released state references that highest revision"), which `rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased`'s current statement and `scenarios/knowledge/revising-a-released-revision-creates-the-next` have since superseded. Flagged so a reader of the candidate set does not implement the older basis — a follow-up `/analyse` correction, not this task's to reword.
