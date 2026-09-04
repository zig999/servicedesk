---
title: Each listed revision states its own draft/released state, independent of the current-pin indicator
summary: Proves the widened hook exposes a per-revision state field closed to draft/released, that the revision-history screen renders it as an independent column beside the pre-existing current/frozen indicator, and that pre-existing coverage for the unchanged parts of the shape (revision/criterion/collects, the hypotheses-tab count) still holds.
implementation: sha256:cff109fb597ab5e42fc49b393e3bc9e6fdd7d29c556e5c5dbc4e73e57e292b5e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/hypothesis-revision-own-state-ui-show-each-revisions-own-state-suite
tests:
- file: src/hooks/use-hypothesis-revisions.spec.ts
  name: answers each revision's own state exactly as the endpoint returned it, draft or released, unmodified
  proves: 'criterion: ''The typed page shape the revisions listing hook answers carries a per-revision own-state field...'' -- the field reaches the caller unrenamed and untransformed, for both possible values'
  fails_when: the hook's answered page drops the state field, renames it, or returns a value other than the one the mocked endpoint sent for either item
- file: src/hooks/use-hypothesis-revisions.spec.ts
  name: admits only "draft" and "released" as its literal values
  proves: criterion 1's closed-value clause -- HypothesisRevisionState is draft or released and nothing else -- enforced at compile time via a suppressed type error, decided by the project's own typecheck step (npm run typecheck) rather than by vitest's runtime pass alone
  fails_when: HypothesisRevisionState is widened to accept a value beyond "draft"/"released" (or to a bare string), which removes the type error the @ts-expect-error line currently suppresses and surfaces as an "unused @ts-expect-error directive" failure under npm run typecheck; the runtime assertion itself only records the three literal values exercised
- file: src/routes/hypothesis-revision-history-own-state.spec.ts
  name: states each row's own state as Draft or Released, matching what the listing answered for that revision
  proves: 'criteria: ''Every row ... states the own state of the revision on that row'' and ''A revision the listing answers as draft renders as draft and a revision it answers as released renders as released'' -- checked across two rows of opposite state in one mount'
  fails_when: either row is missing its own-state label, or the label is swapped, defaulted, or identical for both rows regardless of the answered value
- file: src/routes/hypothesis-revision-history-own-state.spec.ts
  name: colors a draft revision's own-state indicator bg-warning and a released one bg-success
  proves: the implementation record's disclosed inference that the own-state badge uses bg-warning/Draft and bg-success/Released, reusing the app's own draft/released convention
  fails_when: either row's own-state indicator carries a different color class, or the two rows share the same color
- file: src/routes/hypothesis-revision-history-own-state.spec.ts
  name: labels a column "State", placed between the Revision and Status columns
  proves: the implementation record's disclosed inference on column placement and header text -- a silent choice made observable as the exact header order a screen reader or sighted user would encounter
  fails_when: the "State" header is absent, mislabeled, or reordered relative to Revision and Status
- file: src/routes/hypothesis-revision-history-own-state.spec.ts
  name: renders the currently pinned revision's own draft state without the pin turning it into released
  proves: 'criterion: ''A row states its revision''s own state and the case''s current-pin indication as two separate facts...'' -- the current+draft combination'
  fails_when: the pinned row's own-state label reads Released instead of Draft, or the "current" indication is lost when paired with a draft own-state
- file: src/routes/hypothesis-revision-history-own-state.spec.ts
  name: renders a frozen (non-current) revision's own released state without the freeze suppressing it
  proves: the same criterion's own contrasting example -- 'a row can read released and not-current at the same time' -- the released+frozen combination
  fails_when: the frozen row's own-state label reads Draft instead of Released, or the "frozen" indication disappears once paired with a released own-state
- file: src/routes/hypothesis-revision-history-own-state.spec.ts
  name: renders no own-state label for a state value the wire sent outside draft/released, rather than inventing one
  proves: the practical consequence of criterion 1's closed mapping for a value the wire could send anyway (apiFetch performs no runtime validation) -- also covers a wire response that omits the field entirely, since indexing REVISION_STATE_CELL with an absent key behaves identically to indexing it with an unrecognized one
  fails_when: the state cell renders any text (an invented label, the raw unrecognized value, or a stale value from another row) for a revision whose state is outside draft/released
- file: src/routes/hypothesis-revision-history.spec.ts
  name: lists every revision the endpoint returns, each showing its own revision number, criterion and collects, as a closed, non-editable block
  proves: 'criterion: ''The revision numbers, criteria and collects each row already showed are unchanged...'' (the non-ordering part) -- pre-existing, unaffected by this task''s edits; cited rather than duplicated'
  fails_when: a row's revision number, criterion or collects text stops matching what the listing answered, or a row goes missing
- file: src/routes/hypothesis-revision-history.spec.ts
  name: shows a loading placeholder before the revisions and the case's versions both arrive
  proves: the dependency-answers-slowly edge case for this screen -- pre-existing, unaffected by widening the item type
  fails_when: the loading placeholder stops appearing, or a table renders before both queries settle
- file: src/routes/hypothesis-revision-history.spec.ts
  name: shows a failure placeholder with a retry action when loading revisions fails
  proves: the dependency-fails edge case for this screen -- pre-existing, unaffected
  fails_when: the failure placeholder or its retry action stops appearing on a rejected fetch
- file: src/routes/hypothesis-revision-history.spec.ts
  name: treats a hypothesis with zero revisions as a load failure rather than an empty state
  proves: the empty-collection edge case for this screen's listing -- pre-existing, unaffected
  fails_when: a zero-revision response renders as an empty table or silently nothing, instead of the failure state
- file: src/routes/case-hypotheses-tab.spec.ts
  name: shows each hypothesis's Revisions count as the endpoint's own total, never the length of the page it returned
  proves: 'criterion: ''The hypotheses tab''s per-hypothesis revision count still reads the listing''s own total after the shape widens.'' -- pre-existing, unaffected by widening HypothesisRevisionListItem; cited rather than duplicated'
  fails_when: the count stops reading total, or reads the page's own length instead
untested:
- The task's own UNDERDETERMINED note observes that no criterion holds the revision-history screen to constraints/no-route-enforces-authentication's per-screen no-authentication disclosure; it names no specific implementation that violates it -- only that a rewrite omitting the disclosure would still pass every stated criterion -- so no test is written against a named implementation. This is a finding about the criteria's own coverage, not a defect this delivery introduced, and it stays open.
- 'The implementation record''s own inference that use-manifest-row-revisions.spec.ts''s revisionItem() fixture factory defaults the new required state field to "released" rather than "draft" names a pure test-arrangement choice: the record itself states neither literal satisfies or narrows any of that file''s own criteria, so it has no externally observable behavioral consequence and no test is written for it.'
- 'Criterion 5''s ''rows stay ordered highest revision first'' clause: no pre-existing test and none this proof adds asserts the rendered rows'' actual DOM order against descending revision number -- every lookup (existing and new) locates a row by its own revision-number text, independent of position, so a regression that rendered the same rows in reverse order would pass every test in this suite. The sort itself is untouched by this task, but the gap predates it and is real.'
not_applicable:
- edge_case: A numeric boundary at either end of a range
  why: This task's only new value domain is the closed draft/released enumeration, not a numeric range; no criterion states a boundary to test.
- edge_case: A duplicate where uniqueness is claimed
  why: No criterion claims uniqueness over a revision's own state -- multiple revisions of the same hypothesis are expected to share a state value, and nothing treats that as a conflict.
- edge_case: An operation against state that forbids it
  why: This task renders an already-fetched, read-only field; it introduces no mutation and no state-dependent refusal for this proof to exercise.
- edge_case: Two operations against one subject at once
  why: The revisions listing and current-pin queries are read-only and independently fetched by pre-existing hooks this task does not change; none of this task's six criteria makes a concurrency claim, and write-side guarantees belong to the revision-lifecycle tasks' own proofs.
divergences:
- cites: TST-04
  file: src/routes/hypothesis-revision-history-own-state.spec.ts
  departure: The file sits beside hypothesis-revision-history.tsx, suffixed for the specific behavior it proves, rather than named exactly hypothesis-revision-history.spec.ts.
  why: Mirrors the already-established, previously-delivered precedent for this exact screen -- hypothesis-revision-history-current-pin.spec.ts already splits the same unit's coverage the same way, sharing case-hypotheses-tab.test-support.ts's mounting harness. Matching TST-04 literally would mean growing one of the existing sibling files instead of adding a third, clearly-named one for a distinct concern, which costs more than the departure.
---
## What it is

Twelve tests across three files prove the six criteria: the hook's widened, closed-value type; every row's own-state label tracking the answered value; the own-state and current-pin facts varying independently across both combinations; the pre-existing revision/criterion/collects fields and the hypotheses-tab count staying untouched.
One new file, hypothesis-revision-history-own-state.spec.ts, holds the new own-state coverage; the two pre-existing spec files it sits beside are cited for the criteria they already proved rather than duplicated.

## Notes

None.
