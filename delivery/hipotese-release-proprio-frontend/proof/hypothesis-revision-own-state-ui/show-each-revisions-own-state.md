---
title: Show each listed revision's own state -- proof
summary: Tests the widened HypothesisRevisionListItem shape, the revision-history screen's new per-row state rendering and its independence from the current-pin indicator, the preserved ordering, and (by citing pre-existing, untouched tests) the preserved revision/criterion/collects fields and the hypotheses tab's total-reading.
implementation: sha256:cff109fb597ab5e42fc49b393e3bc9e6fdd7d29c556e5c5dbc4e73e57e292b5e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/hypothesis-revision-own-state-ui-show-each-revisions-own-state-suite-corrected-2
tests:
- file: src/hooks/use-hypothesis-revisions.spec.ts
  name: useHypothesisRevisions -- carrying each revision's own state through to the answered page > reads a draft revision's own state through unchanged
  proves: The typed page shape the revisions listing hook answers carries a per-revision own-state field whose value is draft or released and nothing else -- the draft half.
  fails_when: The hook drops, renames, or fails to surface the fetched state field for a draft revision, or maps it to a different value.
- file: src/hooks/use-hypothesis-revisions.spec.ts
  name: useHypothesisRevisions -- carrying each revision's own state through to the answered page > reads a released revision's own state through unchanged
  proves: The same criterion's released half.
  fails_when: The hook drops, renames, or fails to surface the fetched state field for a released revision, or maps it to a different value.
- file: src/hooks/use-hypothesis-revisions.spec.ts
  name: useHypothesisRevisions -- carrying each revision's own state through to the answered page > carries each revision's own state independently of its position in the answered page
  proves: The own-state field is per-item (not a single derived or shared value), preserved 1:1 against a mixed-state response.
  fails_when: The hook computes one state applied to every item, drops an item, reorders items, or otherwise fails to keep each item's own state matched to its own revision.
- file: src/hooks/use-hypothesis-revisions.spec.ts
  name: HypothesisRevisionState -- a closed union of exactly draft and released > refuses a third value as a revision's own state, at compile time
  proves: The "and nothing else" clause of the same criterion -- no third value is representable by HypothesisRevisionState.
  fails_when: HypothesisRevisionState is widened (e.g. to string, or a union gaining a third literal), which makes the // @ts-expect-error directive superfluous and fails the project's typecheck step with an unused-directive error (TS2578) -- the signal this test relies on lives in npm run typecheck's output, not vitest's.
- file: src/routes/hypothesis-revision-history-own-state.spec.ts
  name: HypothesisRevisionHistory -- each row states its own revision's draft or released state > renders Draft on a row whose revision answered draft and Released on a row whose revision answered released, in the same listing
  proves: Every row the revision-history screen renders states the own state of the revision on that row, and a revision the listing answers as draft renders as draft and a revision it answers as released renders as released.
  fails_when: Any row is missing its own-state cell, or a row's rendered label inverts, defaults, or otherwise fails to match the state value the listing answered for that revision.
- file: src/routes/hypothesis-revision-history-own-state.spec.ts
  name: HypothesisRevisionHistory -- a row's own state and the case's current-pin indication are two separate facts > shows a not-current revision as released, so a row reads released and frozen at the same time
  proves: A row states its revision's own state and the case's current-pin indication as two separate facts, so a row can read released and not-current at the same time.
  fails_when: The released label and the frozen label stop both rendering on the same row -- e.g. the state cell becomes coupled to the current-pin computation, or the current-pin label overrides or suppresses the own-state label.
- file: src/routes/hypothesis-revision-history-own-state.spec.ts
  name: HypothesisRevisionHistory -- a row's own state and the case's current-pin indication are two separate facts > shows the current revision as draft, so a row reads draft and current at the same time
  proves: The same criterion's converse combination, ruling out an implementation that only lets a released revision be current.
  fails_when: The draft label and the current label stop both rendering on the same row.
- file: src/routes/hypothesis-revision-history-own-state.spec.ts
  name: HypothesisRevisionHistory -- own-state indicator coloring (disclosed inference) > paints a draft revision's own-state indicator bg-warning and a released revision's bg-success
  proves: The own-state badge uses bg-warning/"Draft" for draft and bg-success/"Released" for released (the implementation record's disclosed inference).
  fails_when: The state cell's markup stops carrying bg-warning for a draft row or bg-success for a released row.
- file: src/routes/hypothesis-revision-history-own-state.spec.ts
  name: HypothesisRevisionHistory -- row ordering with the State column present > keeps the rows ordered by revision number highest-first, regardless of the state column added
  proves: the rows stay ordered highest revision first after the shape (and the row) widened with the new state column.
  fails_when: The rendered rows appear in fetch/array order instead of revision-descending order, or the new column disturbs the existing sort.
- file: src/routes/hypothesis-revision-history.spec.ts
  name: HypothesisRevisionHistory (criterion 5) > lists every revision the endpoint returns, each showing its own revision number, criterion and collects, as a closed, non-editable block
  proves: The revision numbers, criteria and collects each row already showed are unchanged -- the field-preservation half of this task's criterion 5. Pre-existing, untouched by this task's edit (only a state key was added to the same row object), so this existing test is the proof rather than a new one written now.
  fails_when: A row stops showing its own revision number, criterion text, or joined collects list.
- file: src/routes/case-hypotheses-tab.spec.ts
  name: CaseHypothesesTab (criterion 3) > shows each hypothesis's Revisions count as the endpoint's own total, never the length of the page it returned
  proves: The hypotheses tab's per-hypothesis revision count still reads the listing's own total after the shape widens. case-hypotheses-tab.tsx was not touched by this task (it reads only .total, a field untouched by widening the per-item shape), so this pre-existing test is the proof.
  fails_when: The count cell stops reading .total (e.g. reads .data.length instead), or the widened item shape breaks that read.
not_applicable:
- edge_case: Two listed revisions sharing the same revision number but disagreeing on state.
  why: The listing's per-revision uniqueness is a backend-contract fact this task's criteria do not touch or defend against client-side; not raised by any stated criterion.
- edge_case: A listing response answering an item with a missing or malformed state value.
  why: HypothesisRevisionListItem declares state required and closed to draft/released; a malformed wire response is a backend-contract violation, not a case this task's criteria ask the screen to guard against.
- edge_case: Very large revision counts / pagination boundaries.
  why: Governed by constraints/listings-are-paged, which this task explicitly leaves untouched (only the per-item shape widened); no new paging behavior is introduced for this task to prove.
- edge_case: A release mutation racing with the state render (concurrent operations).
  why: Belongs to the sibling hypothesis-revision-own-release task's own criteria and its own tests (already present in hypothesis-revision-history-release-action.spec.ts); this task's criteria concern only reading and rendering the listed state.
untested:
- The task's Notes entry 'UNDERDETERMINED, from the specification -- constraints/no-route-enforces-authentication ...' names no candidate implementation to test against; it observes that no criterion of this task reaches the no-authentication disclosure at all, a clause no test can be written to fail over without inventing the implementation the binder declined to name. This absence is the binder's own finding and is recorded here rather than guessed at.
- The implementation record's inference that use-manifest-row-revisions.spec.ts's revisionItem() fixture factory now defaults state to "released" is a test-fixture-only change with no production-observable behavior of its own (it exists solely so a pre-existing fixture keeps compiling against the now-required field); no behavioral test is written to prove a fixture default, since asserting it would test the test suite rather than the application.
divergences:
- cites: TST-04
  file: src/routes/hypothesis-revision-history-own-state.spec.ts
  departure: The file is named for the unit plus a behavior suffix ("-own-state") rather than exactly hypothesis-revision-history.spec.ts.
  why: hypothesis-revision-history.tsx already carries a same-named .spec.ts file covering its own, earlier-established criteria. This project's own existing convention for a unit that later tasks add coverage to is a suffixed sibling file sitting beside the same unit (already used by hypothesis-revision-history-current-pin.spec.ts and hypothesis-revision-history-release-action.spec.ts) rather than one file growing without bound; this proof follows that established convention rather than introducing a new one.
---
## What it is

Eight new tests across two new files prove the six criteria; three pre-existing, untouched tests are cited for the parts of the shape this task did not change.

## Notes

This record replaces a prior version whose two new-file test claims were fabricated -- the files were never written to disk, and the suite that "passed" only ran the pre-existing suite unchanged. Caught by independent verification (diffing the delivery commit and grepping the captured test log) rather than trusted on the delegation's word. The test-author was re-run, this time verified to have actually written src/hooks/use-hypothesis-revisions.spec.ts and src/routes/hypothesis-revision-history-own-state.spec.ts to disk before this record was composed; the suite's own test-file count rose from 162 to 169 and its test count from 1124 to 1171, confirming the new files genuinely ran. One lint failure (testing-library/no-node-access on two lines) was found and fixed along the way.
