---
target: frontend
title: Apply confirmation diff proof
summary: Proves the pure diff service's top-level and four-nested-key itemisation, its
  not-itemisable fallback, and their rendering in the apply-over-unsaved-edit confirmation dialog,
  through two new sibling spec files; criterion 6 is already proven by a pre-existing test cited
  rather than duplicated.
implementation: sha256:1911d59d1c9c6a6dabf9667d32ed5d35e437d2427c5bb7dcce495141e5d49caf
run: run/drafted-answer-disclosure-apply-confirmation-diff-suite-3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
tests:
- file: src/services/connector-configuration-apply-diff.spec.ts
  name: reports a key only the draft holds as added, a key only the field holds as removed, and
    a key both hold with different values as changed
  proves: Criteria 1, 2 and 3 -- where the field's unsubmitted content and the draft's
    configuration are both well-formed JSON object text, the added, removed and changed top-level
    keys are computed as one structured result.
  fails_when: topLevel.added, topLevel.removed or topLevel.changed omits a key that should be in
    it, or names a key that should not be.
- file: src/services/connector-configuration-apply-diff.spec.ts
  name: computes each of statusMap, responseMap, query and headers own added, removed and changed
    keys, one case per key
  proves: Criterion 4 -- for each of the four named nested objects, held as a JSON object by both
    sides, its own added, removed and changed keys are computed one level deeper.
  fails_when: for any one of the four named keys, its nested diff omits an added or removed
    member it should carry, or reports an unchanged member as changed (or vice versa).
- file: src/services/connector-configuration-apply-diff.spec.ts
  name: returns kind "not-itemisable" for an empty string, invalid JSON, a JSON array, string,
    number, boolean and null
  proves: Criterion 5 -- every shape "not well-formed JSON object text" names yields kind
    "not-itemisable", regardless of what the draft's own text holds.
  fails_when: any of these seven field-text shapes yields kind "itemisable" instead of
    "not-itemisable".
- file: src/routes/connector-configuration-form-fields-apply-confirmation-diff.spec.ts
  name: lists the added, removed and changed top-level keys between the unsaved edit and the
    draft
  proves: Criteria 1, 2 and 3 as rendered at the surface -- the confirmation dialog actually
    displays the added, removed and changed top-level keys to the operator, not merely computes
    them.
  fails_when: opening the confirmation with a field and draft differing at the top level fails to
    render an "Added:", "Removed:" or "Changed:" entry for the key that differs that way.
- file: src/routes/connector-configuration-form-fields-apply-confirmation-diff.spec.ts
  name: lists statusMap's own added and removed keys, distinct from any top-level entry
  proves: Criterion 4 as rendered at the surface -- one of the four named nested objects, held by
    both sides, has its own added/removed keys disclosed to the operator, one level deeper than
    the top-level list.
  fails_when: opening the confirmation with a shared, differing statusMap fails to render its own
    added or removed status-code key.
- file: src/routes/connector-configuration-form-fields-apply-confirmation-diff.spec.ts
  name: shows the not-itemisable statement instead of any added, removed or changed key
  proves: Criterion 5 as rendered at the surface -- a field holding content that is not
    well-formed JSON object text gets the "cannot be itemised" statement, not a silently empty or
    wrong itemisation.
  fails_when: no text mentioning "cannot be itemised" renders once the confirmation opens over a
    field whose content is not well-formed JSON object text.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: keeps the Configuration field's value exactly as it stood, writing none of the draft's
    text, once Keep editing is clicked
  proves: (pre-existing, cited rather than duplicated) Criterion 6 -- where the operator does not
    confirm, the field's content stands exactly as it was. Reading handleApply,
    handleConfirmApply and the Keep editing DialogClose confirms none of this task's edit touched
    the path this test exercises.
  fails_when: the Configuration field's value differs from what it held before the confirmation
    was opened, once Keep editing is clicked.
not_applicable:
- edge_case: A duplicate key within one side's own JSON object text (e.g. '{"a":1,"a":2}').
  why: JSON.parse itself collapses this to its last value before the diff logic ever sees the
    parsed object, so there is no distinct "duplicate key" case left to decide.
- edge_case: An absent or undefined field or draft text.
  why: computeApplyConfirmationDiff's own signature requires two strings, and both the field's
    value and the draft's configuration are required string attributes; nothing in this task's
    criteria admits an absent value reaching this function.
- edge_case: Concurrent or overlapping confirmation requests.
  why: computeApplyConfirmationDiff is a pure, synchronous, side-effect-free computation with no
    state shared across calls, and no criterion of this task addresses overlapping requests.
- edge_case: A slow or failing dependency.
  why: The diff computation touches no network, storage or clock; the one asynchronous step in
    the surrounding flow (fetching the draft) is a different task's concern, already covered by
    its own pre-existing tests.
untested:
- rules/integration/an-apply-confirmation-states-what-the-draft-would-change -- its statement is
  a totality over every top-level key and every nested key of an unbounded set of possible JSON
  object shapes; no single, finite test decides that universal claim whole. Criteria 1 through 5
  each get their own representative test, but that only asserts part of the invariant as the
  whole.
- rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation --
  per the task's own REMAINDER note, this task reaches only the node's negative then-clause
  (criterion 6, cited above); the positive clause belongs to the task implementing the
  confirmation gate itself.
- rules/integration/a-connector-configuration-drafts-configuration-is-well-formed-object-text --
  per the task's own REMAINDER note, this node's statement belongs to a different (backend) task;
  this task only consumes it as a premise. The implementation's own defensive not-itemisable
  branch for an unparsable draft side is consequently unreached given that guarantee, and is left
  untested rather than pinned as if the guarantee did not hold.
- 'domain/integration/connector-configuration-draft -- honored rather than encoded: the diff reads
  only the two configuration texts and touches no other attribute of this value object.'
- Recursive deep-equal value comparison for "changed in value" -- the task's own text offers a
  naive JSON.stringify comparison as an acceptable alternative, which would report a
  reordered-but-equal nested object as changed; pinning the deep-equal-specific behavior would
  fail an alternative implementation the task's own text already tolerates.
- Nested itemisation withheld when only one side (or neither) holds one of the four named keys as
  a JSON object -- the task's own text names this exact edge as the implementer's discretionary
  call, offering this resolution only as an example.
- The "Applying this draft would change nothing." statement and the applyConfirmationDiffIsEmpty
  helper backing it -- no criterion requires any particular treatment of an itemisable diff with
  nothing at any level.
---

## What it is
The proof of the itemisation, its not-itemisable fallback, and the rendering that surfaces both to the operator.

## Notes
Suite round 1 failed: the new route spec's `openApplyConfirmation` helper did not set the Connector
field before clicking Request Draft, which the already-delivered draft-request-gate (task 6)
correctly withholds without one. Fixed by filling the Connector field in that helper. Suite round 2
still failed 2 of 3 new tests: the `listItem` helper's custom text matcher (`content === text` on an
LI element) never matched, even though the rendered DOM (visible in the failure's own dump) held
exactly the expected `<li>Added: <span>c</span></li>` structure -- a known testing-library gotcha
where a hand-rolled content-equality matcher does not reliably see the full concatenated textContent
of an element with mixed text/element children. Fixed by rewriting `listItem` to the standard
testing-library recipe for text split across elements (match on the element's own textContent while
confirming no child element repeats the same text). Suite round 3 green.
